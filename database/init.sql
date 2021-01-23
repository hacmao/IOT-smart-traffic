CREATE TABLE IF NOT EXISTS smart_traffic (camera_id TEXT not null, time INT, status_road INT);
CREATE TABLE IF NOT EXISTS camera (camera_token TEXT not null PRIMARY KEY, ip TEXT, x INT, y INT);
CREATE TABLE IF NOT EXISTS user (username TEXT not null PRIMARY KEY, password TEXT not null); 

INSERT INTO camera VALUES ("ef19530563f3c7ded2047b3dbd23547b", "192.168.1.38", 120, 385);
INSERT INTO camera VALUES ("af19530563f3c7ded2047b3dbd23547c", "", 500, 250);
INSERT INTO camera VALUES ("bf19530563f3c7ded2047b3dbd23547d", "", 180, 150);

INSERT INTO user VALUES ("admin", "123456");
