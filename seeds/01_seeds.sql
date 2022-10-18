INSERT INTO users (name, email, password)
VALUES
('Wilma', 'Willy123@hotmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('John', 'JohnDoe@hotmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
('Billy', 'Billy@hotmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u');


INSERT INTO properties (owner_id,title,description,thumbnail_photo_url,cost_per_night,country,street,city,province,post_code,active)
VALUES
(1, 'Big House','Big house near water','Picture1.jpeg', 250,'Canada','4543 East 55th ave','Vancouver','BC', 'v5w1w2', true ),
(2, 'Small Apartment','City Highrise','Picture2.jpeg', 150,'USA','McDonalds Street','Washington','DC', '49912', true ),
(3, 'Big House','Big house near water','Picture3.jpeg', 25,'Brazil','Forest Ave','Forest City','AB', '230012', true );

INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES 
('2018-09-11', '2018-09-26', 1, 1),
('2019-01-04', '2019-02-01', 2, 2),
('2021-10-01', '2021-10-14', 3, 3);

INSERT INTO property_reviews (guest_id,property_id,reservation_id,rating,message)
VALUES 
(1,1,1,5,'Wonderful'),
(2,2,2,3,'Meh'),
(3,3,3,1,'Never AGAIN!');