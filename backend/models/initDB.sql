CREATE TABLE IF NOT EXISTS menu (
    name TEXT NOT NULL,
    unit_price NUMERIC NOT NULL,
    PRIMARY KEY (name) 
);
CREATE TABLE IF NOT EXISTS valid_statuses (
    status TEXT,
    PRIMARY KEY (status)
);
CREATE TABLE IF NOT EXISTS customer_order (
    id UUID DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    PRIMARY KEY (id),
    FOREIGN KEY (status) REFERENCES valid_statuses(status)
);
CREATE TABLE IF NOT EXISTS chosen_item (
    order_id UUID NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    PRIMARY KEY (order_id, name),
  FOREIGN KEY (order_id) REFERENCES customer_order(id) ON DELETE CASCADE,
    FOREIGN KEY (name) REFERENCES menu(name) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION update_total_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chosen_item
    SET price = (
        SELECT unit_price * quantity AS price
        FROM menu INNER JOIN chosen_item
        ON menu.name = chosen_item.name
        WHERE menu.name = NEW.name
        AND order_id = NEW.order_id
    )
    WHERE order_id = NEW.order_id
    AND name = NEW.name;
    UPDATE customer_order
    SET total_price = (
        SELECT COALESCE(SUM(price), 0)
        FROM chosen_item
        WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER recalculate_total_price
AFTER INSERT OR DELETE ON chosen_item
FOR EACH ROW
EXECUTE FUNCTION update_total_price();

INSERT INTO menu(name,unit_price)
VALUES
('Ramen',100 ),
    ('Tanghulu',55 ),
    ('Yasai Tempura',60 ),
    ('Corn Dog',90 ),
    ('Falooda',70 ),
    ('Strawberry Boba',80 ),
    ('Kiwi Boba',80 ),
    ('Litchi Boba',80 ),
    ('Passion Fruit Boba',80 ),
    ('Ramen Add-on: Spicy Sauce',5 ),
    ('Ramen Add-on: Paneer',10 ),
    ('Boba Add-on: Blueberry Syrup',0 ),
    ('Boba Add-on: Strawberry Syrup',0 ),
    ('Boba Add-on: Kiwi Syrup',0 )
;

INSERT INTO valid_statuses
VALUES
('Pending'),
('Cooked'),
('Delivered')
;