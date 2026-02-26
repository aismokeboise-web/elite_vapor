--
-- PostgreSQL database dump
--

\restrict eyurXZDAw4T2XzFVA0Xn5EM4ueYr5hSsAVhgOFpXyKgb9H6n8VqzTOKGirXIH6k

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Admin" VALUES ('Administrator', '$2b$10$gJ8H.jVxVHz4xNt.8sq1Pu34KJd5AW51Y47o.DDua2HOZP9o2wOc.', 'abc.example.com');


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Category" VALUES ('cmlato26x0000w8x1zot9evp9', 'Accessories', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Category" VALUES ('cmlatocjb0001w8x1lato44om', 'Devices', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Category" VALUES ('cmlatok4v0002w8x127j39xug', 'Disposables', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Category" VALUES ('cmlatp6jw0003w8x18756xjag', 'Nicotine Pouches', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Category" VALUES ('cmlatpenr0004w8x13kkzv5x7', 'Papers', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Category" VALUES ('cmlatpl4e0005w8x10z9rhyhc', 'Vape Juice', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');


--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Brand" VALUES ('cmlatqqxl0006w8x14sy1imhj', 'Foger', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatrbx60007w8x1qh3eyflh', 'Foger Kit', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatro1m0008w8x1bazfb4xg', 'Foger Pod', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlats0rx0009w8x1n1qzq7v4', 'Geek Bar Pulse', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatshgd000aw8x1u5djdro4', 'Geek Bar Pulse X', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatsune000bw8x1y475i7bs', 'Lost Mary', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlattapa000cw8x1k3xxmwmf', 'Off Stamp Crystal Cube', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlattpjr000dw8x1po0qylbw', 'Fifty Bar', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatufx3000fw8x1jhmbwjw7', 'Horizon Tech', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatvndt000hw8x12ree05l0', 'Smoke', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatwdpg000iw8x12vxnl0di', 'Vaporesso', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatwn7i000jw8x178a1wxl6', 'Naked', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatwv7t000kw8x1sx5jrhxp', 'Monster', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatx682000lw8x1o4962l1x', 'BSX', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatxf1u000mw8x1ut8ygums', 'Daze', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatxot6000nw8x1tyaasuof', 'Sad Boy', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatzeye000ow8x18lphwhtu', 'MRKT PLCE', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlatzr41000pw8x1fzw3i834', 'Innevape', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau04wb000qw8x14xicc302', 'Vapetasia', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau0pva000rw8x17f0pdfyz', 'Cuttwood', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau10l9000sw8x17z85z4pq', 'Pod Juice', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau1agm000tw8x1dopkcy7i', 'The Milk', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau1kof000uw8x1aduiumoy', 'Uwell', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau1v55000vw8x1652th2n5', 'Caliburn', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau24cj000ww8x1bb7q93zn', 'Raw', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau2lbf000xw8x1f70vswsa', 'Loose Leaf', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau2uor000yw8x1of496yr1', 'ZYN', 'cmlatp6jw0003w8x18756xjag', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau36cx000zw8x1wt6e94jk', 'Pouch Nerdz', 'cmlatp6jw0003w8x18756xjag', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau3dff0010w8x1l18hucfu', 'Sesh', 'cmlatp6jw0003w8x18756xjag', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau3tx20011w8x1f6spe4nq', 'Nikot Gum', 'cmlatp6jw0003w8x18756xjag', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau49d30012w8x1vtsi2unb', 'Zig Zag', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau4l140013w8x1pxrb267k', 'Blazy Susan', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau53mh0014w8x1mm126nn1', 'Elements', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau5t790015w8x1yi35s6dt', 'King Palm', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlau6bu70016w8x1cub41md7', 'Bugler', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('5cfe132d-bbac-498d-a9a5-e272196bb5dc', 'Geek Bar', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('ca808e4d-f082-416a-9a96-f9684e06bae4', 'RAZ', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('6b419dcf-06dd-4ebc-97e1-1d5a5d146199', 'Adjust', 'cmlatok4v0002w8x127j39xug', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('19318225-43e2-48a3-b6fe-5a6a296a8877', 'VOOPOO', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('04696c63-43d6-487a-80ca-d3bc632e140c', 'Lost Vape', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('d128c3e9-05de-4c56-9432-2755e7662677', 'Grabba Leaf', 'cmlatpenr0004w8x13kkzv5x7', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmlaturi5000gw8x1j7r181iz', 'GeekVape', 'cmlatocjb0001w8x1lato44om', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('45c16486-b285-4408-affb-c3eedcf66cf1', 'Coastal Clouds', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('b471533a-f839-42bf-b8fa-aba24e2790d6', 'Cloud Nurdz', 'cmlatpl4e0005w8x10z9rhyhc', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Brand" VALUES ('cmm3oj8f70000y8x1lns8z9m1', 'abcd', 'cmlatocjb0001w8x1lato44om', '2026-02-26 16:30:28.193', '2026-02-26 16:30:28.193');


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Message" VALUES (1, 'abc', 'a@gmail.com', 'ad', 'dagg gdas', '2026-02-19 08:40:59.901');


--
-- Data for Name: Model; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Model" VALUES ('4a6bb80f-4bf3-49da-8e97-67b6c056926e', 'Coastal Clouds', 17.99, 'Award-winning flavors ranging from sweet desserts to chilled fruits.', '{"Vanilla Custard","Vanilla Tobacco","Strawberry Kiwi",Tobacco,Menthol,"Red White and Berry",Mango,"Melon Berries","Chilled Apple Pear","Citrus Peach","Blood Orange Peach","Blueberry Limeade","Apple Peach Strawberry","Apple Watermelon","Strawberry Kiwi (Iced)","Apple Watermelon (Iced)","Blood Orange Peach (Iced)","Mango Berries (Iced)","Caramel Brulee"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:07:42.436', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('e2db738e-430c-4e8b-9ffe-19620ab68737', 'Foger Kit', 29.99, 'Full modular system including the rechargeable battery base and pre-filled pod.', '{"Blue Razz Ice","Blueberry Watermelon",Clear,Coffee,"Cool Mint","Gum Mint","Gummy Bear","Icy Mint","Juicy Peach Ice","Kiwi Dragon Berry","Mexican Mango","Miami Mint","Pineapple Cocunut","Sour Apple Ice","Strawberry Banana","Strawberry Cupcake","Strawberry Ice","Strawberry Kiwi","Strawberry Watermelon","Watermelon Bubble Gum","Watermelon Ice","White Gummy","Sour Cranapple","Sour Gush","Sour Blue Dust","Strawberry B Pop","Blue Rancher"}', '{/uploads/1771422401755-FogetKit-01-compressed.jpg,/uploads/1771422401755-fogerKit-02-compressed.jpg,/uploads/1771422401755-fogetKit-03-compressed.jpg}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('e061445a-b9f9-4d89-99a4-a7dd85594287', 'Adjust', 24.99, 'Features 5-level adjustable cooling and high-capacity puff count.', '{"Baja Splash","Blue Razz Ice","Cherry Straz","Dragon Strawnana","Mango Magic","Miami Mint","Mixed Mint","Peach +","Sour Apple Ice","Sour Lush Gummy","Sour Strawberry DragonFruit","Strawberry Banana","Strawberry Mint Candy","Summer Splash","Tiger Blood","Watermelon Ice","Watermelon Mango Peach","Watermelon Roll Ups","Wintergreen Savers"}', '{/uploads/1771422381520-adjust-01-compressed.jpg,/uploads/1771422381521-adjust-02-compressed.jpg,/uploads/1771422381523-adjust-03-compressed.jpg}', false, true, true, false, '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('603dd3b9-96d0-406f-91c5-cab616f2c350', 'B100 (Aegis Boost Pro 2)', 52.99, 'A high-performance pod mod with 4.5mL top-airflow leak-proof pods and P Series coil compatibility.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:37:02.985', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('5e26b446-b621-4033-895f-d5c1704f464c', 'Novo 5 Kit', 21.99, 'A sleek pod system featuring an air-inlet ring and dual firing modes for a customizable MTL experience.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:48.547', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('ad5fefaa-fb46-474e-9b49-9373f8e126da', 'H45 Classic (Hero 3)', 27.99, 'The 15% lighter version of the Hero 2, maintaining the classic Aegis aesthetic with better portability.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:39:38.042', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('b105a925-c604-4734-8484-9fb03830b08c', 'Aegis Legend 2 (L200)', 74.99, 'The lighter and smaller successor to the legendary Aegis Legend, paired with the leak-proof Z Sub-Ohm tank.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:32:26.716', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('029c1751-dfd4-46eb-ba99-feba3381f23c', 'Aegis Solo 2 (S100)', 44.99, 'A compact single-battery mod with an A-Lock accidental press protection system and a large 1.08-inch screen.', '{}', '{}', false, true, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:36:55.653', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('30ca1004-9ecc-4f54-85f4-c0e6fc32a092', 'G-Priv 4 Kit', 89.99, 'A high-end touch screen mod kit paired with the TFV18 Mini Tank for massive vapor production.', '{}', '{}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-20 16:38:59.247', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('4be20395-283d-461c-9cbe-06d6c1b50198', 'GeekVape Hardware', 79.99, 'Durable, IP68-rated box mods and kits built for power and longevity.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:39:07.772', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('8786b7b7-0b4b-4dbb-bb50-bfbe0f9ba694', 'L200 Classic Kit', 61.99, 'A dual-21700 powerhouse with a 200W output and a Z Max Tank, featuring iconic IP68-rated durability.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:41:45.831', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('0ede9f35-71a6-48bd-9dbb-9bd2afd9223d', 'M100 (Aegis Mini 2)', 66.99, 'Internal 2500mAh battery durability. Features stable output tech for a consistent MTL/RDL vape.', '{}', '{}', false, true, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:02.543', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('c07e75b0-3ef4-454c-ae66-071021d9db9d', 'Mag Solo Kit', 58.99, 'Combining the iconic Mag handle grip with a single 21700 battery for a powerful, ergonomic DTL vape.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:10.358', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('fa713792-eb20-4344-8fc6-a314990b2bbc', 'Nord 5 Kit', 25.99, 'An 80W powerhouse pod system with a massive 5mL capacity and RPM 3 mesh coil compatibility.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:41.89', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('4605ce7d-9dbd-424b-9ce3-f0b49ee451da', 'T200 (Aegis Touch)', 69.95, 'The ultimate tech-vape featuring a massive 2.4-inch full touch screen and the intelligent AS Chip 3.0.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:43:19.854', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('2ea5adee-075c-4e0c-8d3a-6262b3669b6e', 'Whole Leaf', 7.99, 'Authentic, high-quality whole tobacco leaves for a rich experience.', '{}', '{}', true, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:43:33.508', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('a631f905-6b1a-4f5b-b8ec-15b1a1000d0a', '1 1/4', 2.99, 'The classic 1 1/4 size providing a consistent and slow burn.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:31:05.549', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('9046502d-3d2e-4a9d-a441-3dfe2eda6904', '1 1/4', 3.49, 'Unrefined natural rolling papers made from organic hemp.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:31:12.222', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('f65bdb18-37ee-46d6-bf66-00e99b81578b', '1 1/4 Cones', 4.50, '1 1/4 size pre-rolled pink cones with a smooth draw.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:31:39.485', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('998a6ea9-4a9b-4a35-8576-ce21bfca26e3', '1 1/4 Paper', 3.99, 'Pure rice papers with a natural sugar gum base.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:31:46.279', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('70786887-8b64-4da9-bc55-5198ddf5d99a', '1 1/4 Paper', 4.50, 'Standard 1 1/4 pink papers for a stylish slow burn.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:31:52.724', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('d6e648c1-1bd2-45c1-9cc9-ee105b438b8d', '1 1/4 Pink Cones', 3.99, 'Slow-burning rice paper cones in a stylish pink hue.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:31:59.852', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('4d79b498-36bf-4d5c-8020-30696a92d240', '1 1/4 Ultra Thin', 2.99, 'Translucent ultra-thin papers for minimal paper taste.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:32:05.765', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('cfbb6cfb-cb6a-4dcd-9bcc-099f7001c594', '70''s', 2.99, 'Classic short length papers for traditional hand-rolling.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:32:12.716', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('c642d034-eb62-4885-b032-33da3da3a69e', 'Caliburn A3S', 18.99, 'A simple, draw-activated pod system with fast Type-C charging and a sleek, buttonless design.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:37:10.927', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('95c32782-8403-4d4a-9098-c743989492c9', 'Caliburn G3', 20.99, 'The peak of the Caliburn series, offering a 25W max output and Uwell signature Pro-FOCS flavor tech.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:37:19.129', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('d4d7e181-618d-412d-93f1-aa82b300b742', 'Centaurus M200', 49.99, 'A luxury box mod with a unique rotary fire button and interchangeable side panels.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:37:25.119', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('e41e65d0-7377-4708-bedc-ddc2673d8a6e', 'Drag 5 Kit', 65.99, 'The latest in the Drag series, featuring a unique C-frame battery cover and the PnP X atomization platform.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:38:50.101', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('9cb3fb76-05e9-41ed-9284-40f7982cd7f3', 'King', 2.99, 'Full-size king papers for a long-lasting session.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:39:57.793', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('487cb8da-04ed-4812-895c-b2ee9f8616f0', 'King Size', 3.49, 'Classic unrefined king size papers for an even burn.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:40:10.106', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('3e0cbd0c-22ee-44ba-873c-5a4f29ca5bfc', 'King Size Cones', 4.50, 'Pre-rolled pink cones for convenience and style.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:40:17.599', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('7fe85cff-0358-479d-9f90-3ff2cbcc017f', 'Kutcorners', 2.99, 'Traditional easy-roll papers with cut corners for a seamless fit.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:41:35.795', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('bc3a6ac9-43d2-4876-860a-51b15576ee3b', 'King Size Slim', 3.49, 'Slimmer profile king size papers with criss-cross watermark.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:40:33.946', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('486cec35-fc1a-4871-89b3-49d04c574bdc', 'Luxe XR Max', 29.89, 'An 80W pod mod with a massive 2800mAh internal battery, compatible with the full range of GTX coils.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:41:54.813', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('9a7f9de1-56c7-4084-9774-166fb2107dca', 'King Size Supreme', 3.49, 'Premium flat-packed papers for the ultimate smooth burn.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:40:54.875', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('8cac6af5-d869-405e-a865-1458c5f6334d', 'King Slim', 2.99, 'Longer, thinner format for a sleek and premium experience.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:41:01.11', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('55e97ea7-1d44-466c-8a39-87495d019a8c', 'King Slim Paper', 4.50, 'Premium pink wood pulp papers, vegan and non-GMO.', '{}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:41:07.955', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('4a7d13ec-64e8-439d-b126-7185ecedf8f2', '1 1/2', 2.99, 'Wider paper format for those who prefer a larger roll.', '{}', '{}', false, false, true, false, '2026-02-19 17:52:59.082', '2026-02-20 19:01:34.296', 'Buy 1 Get 1 Free');
INSERT INTO public."Model" VALUES ('149b7115-5396-49f9-bbbe-aa8761e4b064', 'Geek Bar Pulse X', 29.99, 'The world''s first 3D curved screen disposable with high-density VPU mesh coils.', '{"Sour Mango Pineapple","Strawberry B Pop","Blackberry B Pop","Lemon Heads","Watermelon Ice","Banana Taffy Freeze","Rashberry Peach Lime","Lime Berry Orange","Strawberry Colada","Strawberry Watermelon","Orange Dragon","Pink & Blue","Cola Slush","Grape Slush","Wild Cherry Slush","Peach Perfect Slush","Orange Slush","Orange Fcuking Fab","Sour Fcuking Fab","Sour Apple Ice","Cool Mint","Miami Mint","Alt Mint","Strawberry Kiwi Ice","Blue Razz Ice","Blue Rancher","White Peach Raspberry","Blackberry Blueberry","Sour Straw","Jam Peach","Jam Strawberry","Jam Orange","Jam Blueberry"}', '{/uploads/1771421038630-geekbar-pulseX-01.jpg,/uploads/1771421038630-geekbar-pulseX-02.jpg,/uploads/1771421038630-geekbar-pulseX-03.jpg}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('dd61e714-da1e-4776-8df2-a1f37a00846b', 'Innevape', 16.99, 'Creators of the world-famous Heisenberg Blue, specializing in bold fruit and menthol hits.', '{Menthol,Heisenberg,Berry,"Berry Menthol","Strawberry Watermelon Peach","Strawberry Watermelon Peach Ice"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:39:44.576', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('3ed2b978-e5e9-452f-9fa1-837681a2d4ce', 'Marketplace', 18.99, 'Complex multi-fruit blends available in both standard and refreshing iced versions.', '{"Blue Punch Berry","Blood Orange Tangoberry","Blood Orange Tangoberry Iced","Brazberry Grape Acai","Brazberry Grape Acai Iced","Forbidden Berry","Forbidden Berry Iced","Grapefruit Citrus Sugarberry","Grapefruit Citrus Sugarberry Iced","Feijoa Pineapple Guava","Feijoa Pineapple Guava Iced","Fuji Pear Mangoberry","Fuji Pear Mangoberry Iced","Nectarine Pitaya Pear","Nectarine Pitaya Pear Iced","Pineapple Peach Dragonberry","Pineapple Peach Dragonberry Iced","Pink Punch Berry","Pink Punch Berry Iced","Thai Apple Melon Razz","Thai Apple Melon Razz Iced","Watermelon Hula Berry Lime","Watermelon Hula Berry Lime Iced"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:19.269', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('9346a17f-ba00-4a92-9ed6-9a190940e611', 'Monster Series', 18.99, 'A massive collection featuring Custard, Fruit, Lemonade, and the original Jam Monster lines.', '{"Gingerbread Crunch",Blueberry,Vanilla,Banana,"Blueberry Vanilla","Strawberry Vanilla","Mixed Berry","Toasted Marshmallow S''mores",Strawberry,Creamsicle,Butterscotch,Blackberry,"Mango Lemonade","Strawberry Lemonade","Watermelon Lemonade","Mint Lemonade",Mango,Raspberry,Peach,"PB & Grape",Grape,"Black Cherry",Apricot,Apple,Lemon,"Strawberry Banana","Passion Fruit Orange Guava","Mango Peach Guava","Blueberry Raspberry Lemon"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:26.577', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('dec3965c-4778-47cf-ac88-272313c58beb', 'Naked 100', 16.99, 'Clean, simple, and high-quality fruit and tobacco blends that define industry standards.', '{"Crisp Menthol","American Patriots",Berry,"Really Berry","Cuban Blend",Eurogold,"Hawaiian POG","Lava Flow",Melon,"Strawberry Pom"}', '{}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-20 16:42:34.303', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('59003710-15ce-4c7e-b9ab-c0b21b472928', 'Pod Juice', 15.99, 'Smooth salt nicotine and freebase eliquids known for intense, clean flavor profiles.', '{"Sour Fruity Worms","Strawberry Pomberry","Mango Strawberry Dragonfruit","Glazed Donut","Cotton Clouds","Blue Razz Lemonade","Blue Razz Slushy","Baja Burst","Jewel Mint"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:42:54.936', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('992366de-5f2b-4a71-9cba-d3a5409e3fff', 'Sad Boy', 17.99, 'Unique dessert and cookie-themed liquids paired with an edgy, high-flavor profile.', '{"Blueberry Jam","Strawberry Jam","Custard Cookie","Strawberry Cheesecake","Key Lime Cookie","Funnel Cake","Punch Berry Ice","Punch Berry","Mango Blood","Mango Blood Ice","Rainbow Blood","Rainbow Blood Ice","Pumpkin Cookie","Butter Cookie","Shamrock Cookie","Coconut Cake"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:43:05.883', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('bbe5fd0b-fe86-4649-9935-7ef212cf4adc', 'Vapetasia', 17.99, 'Gourmet e-liquids famous for their signature creamy custards and vibrant fruit blends.', '{"Pineapple Express","Iced Melons","Rain Bops",Pango,"Pink Lemonade","Iced Watermelon",Trapple,Strawberry,"Strawberry Guava",Melons,Lemon,Grape,"Iced Grape","Blue Razz","Blue Razz Iced","Blueberry Parfait","Blackberry Lemonade","Iced Blackberry Lemonade"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:43:26.406', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('2462be23-4d10-4da8-8ea1-2e76c375dc31', 'H45 (Hero 2)', 49.99, 'A pocket-sized pod mod with top airflow and a 1400mAh battery, utilizing versatile B Series coils.', '{}', '{}', false, true, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:39:31.12', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('1027b5b7-81cf-43b7-93e2-0805e8961990', 'Foger Pod', 21.99, 'Replacement pod for the Foger modular system.', '{"Blue Razz Ice","Blueberry Watermelon",Clear,Coffee,"Cool Mint","Gum Mint","Gummy Bear","Icy Mint","Juicy Peach Ice","Kiwi Dragon Berry","Mexican Mango","Miami Mint","Pineapple Cocunut","Sour Apple Ice","Strawberry Banana","Strawberry Cupcake","Strawberry Ice","Strawberry Kiwi","Strawberry Watermelon","Watermelon Bubble Gum","Watermelon Ice","White Gummy","Sour Cranapple","Sour Gush","Sour Blue Dust","Strawberry B Pop","Blue Rancher"}', '{/uploads/1771420577454-fogerPod-01.webp,/uploads/1771420577462-fogerpod-02.jpg,/uploads/1771420577475-fogerpod-02.webp}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('492dcf3f-017c-48bd-a115-d6590060cfec', 'Geek Bar Pulse', 24.99, 'Original full-screen disposable with dual power modes (Regular/Pulse) and a 650mAh battery.', '{"Berry Bliss","B Pop","Black Cherry","Black Mint","Blue Mint","Blue Razz Ice","Blueberry Watermelon","California Cherry","Cherry Boom","Cool Mint",CreamyMint,"Crazy Melon","Dragon Melon","Drop Sour Saver","Fcuking Fb","Frozen Blackberry","Frozen Cherry Apple","Frozen Pina Colada","Frozen Strawberry","Frozen Watermelon","Frozen White Grape","Grape B Pop","Icy Mint","Juicy Peach Ice","Meta Moon","Mexico Mango","Miami Mint","OMG B Pop","Orange Mint Saver","Paper mint","Pineapple Saver","Pink Lemonade","Sour Apple B Pop","Sour Apple Ice","Sour Blue Dust","Sour Cranapple","Sour Gush","Sour Strawberry","Sour Watermelon Drop","Sparkling Lemon Mint","Spooky Vanilla","Stone Freeze","Stone Mint","Strawberry Banana","Strawberry Kiwi Ice","Strawberry Mango","Tropical Rainbow Blast","Watermelon Ice","White Gummy Ice"}', '{/uploads/1771420788694-geekbar-pulse-01.webp,/uploads/1771420788695-geekbar-pulse-02.jpg,/uploads/1771420788696-geekbar-pulse-03.jpg}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('9a088057-37a4-4cac-b0a0-77cec08eab7a', 'RAZ', 27.99, 'Premium hardware featuring an HD animated screen and dual power modes.', '{"Apple Peach Strawberry","Bangin Sour Berries","Black & Blue Lime","Black Cherry Peach","Blue Razz Ice","Blueberry Punch","Blueberry Watermelon","Cherry Peach","Cherry Strapple",Clear,"Clear Diamond","Clear Sapphire","Frozen Banana","Frozen Cherry Apple","Frozen DragonFruit Lemon","Frozen Juice Strawberry","Frozen Raspberry Watermelon","Georgia Peach","Gush White Grape","Gush Tropical","Iced Blue Dragon","Key Lime Pie","Mango Loco","Miami Mint","New York Mint","Night Crawler","Orange Mango","Orange Pineapple Punch","Passionfruit Orange Guava","Pink Lemonade Minty O''s","Pink Strazzberry","Rainbow Rain","Razzle Dazzle","Sour Apple Watermelon","Sour Watermelon Peach","Strawberry Burst","Strawberry Kiwi Pear","Strawberry Peach Gush",Tobacco,"Triple Berry Punch",WinterGreen}', '{/uploads/1771421231738-raz-01.jpg,/uploads/1771421231738-raz-02.jpg,/uploads/1771421231738-raz-03.jpg}', true, false, false, false, '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('098a038e-e70f-4a5f-84af-6ba745b9541f', 'Cigar Wrap', 8.99, 'Smooth natural tobacco wraps for a traditional cigar feel.', '{}', '{}', false, true, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:37:46.41', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('b518d22c-da5a-4523-9470-a1e1e7cf60dd', 'Cloud Nurdz', 18.99, 'Bold fruit-candy combinations that deliver a nostalgic and sweet experience.', '{"Banana Dragon Berry","Guava Passionfruit","Melon Kiwi","Pineapple Mango","Apple Watermelon","Peach Dragon Fruit","Pomegranate Berry","Peach Melon","Very Berry Hibiscus","Cherry Berry","Blue Raspberry Lemon","Watermelon Berry","Cherry Apple","Strawberry Mango","Sour Watermelon Strawberry","Blue Raspberry Peach","Apple Grape","Strawberry Kiwi","Strawberry Peach"}', '{}', false, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:37:53.631', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('32c05d1b-be0e-43bf-9400-9cdbee052c68', 'King Slim Paper', 3.99, 'Ultra-thin rice papers that produce almost zero ash.', '{}', '{}', false, false, false, true, '2026-02-19 17:52:59.082', '2026-02-20 16:41:16.778', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('2ed477b4-dbd7-4b9c-adfc-94c9f7a0a4e6', 'Shorties Cones', 4.50, 'Compact pink cones perfect for quick sessions.', '{}', '{}', true, false, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:43:13.158', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('084ddb3e-b6bd-4b52-9e31-88533aa9f1c6', 'XROS 4', 29.99, 'Features an all-aluminum body and COREX 2.0 technology for the most accurate flavor reproduction.', '{}', '{}', false, true, false, false, '2026-02-19 17:52:59.082', '2026-02-20 16:43:40.739', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('15058c0a-5388-4893-bbe2-1076edd4d542', '1 1/2', 3.49, 'Natural plant-fiber papers in a wider format.', '{}', '{}', false, true, false, false, '2026-02-19 17:52:59.082', '2026-02-20 18:10:14.773', 'Exclusive Deals Available');
INSERT INTO public."Model" VALUES ('cmm3ojox80001y8x1yqlnffp3', 'abcd', 23.33, 'This is just a test.', '{a1,b1,c1}', '{}', false, false, false, false, '2026-02-26 16:30:49.58', '2026-02-26 16:30:49.58', 'Exclusive Deals Available');


--
-- Data for Name: NewsletterSubscription; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."NewsletterSubscription" VALUES (1, 'a@gmail.com', '2026-02-19 08:41:29.954');
INSERT INTO public."NewsletterSubscription" VALUES (2, 'd@email.com', '2026-02-19 11:47:12.162');


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Product" VALUES ('59e25f10-3c15-4035-bba2-463890c0adfa', 'Geek Bar Pulse', '15,000 Puffs', '5%', '5cfe132d-bbac-498d-a9a5-e272196bb5dc', '{492dcf3f-017c-48bd-a115-d6590060cfec}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('e652fcaa-9a9b-4d6e-88ba-909598b0d46c', 'Geek Bar Pulse X', '25,000 Puffs', '5%', '5cfe132d-bbac-498d-a9a5-e272196bb5dc', '{149b7115-5396-49f9-bbbe-aa8761e4b064}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('d68983e3-33df-48f5-9b93-3ba3c9dad085', 'Foger Kit', '30,000 Puffs', '5%', 'cmlatqqxl0006w8x14sy1imhj', '{e2db738e-430c-4e8b-9ffe-19620ab68737}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('8d63b723-56e3-40dd-b907-8a16b76bde11', 'Foger Pod', '30,000 Puffs', '5%', 'cmlatqqxl0006w8x14sy1imhj', '{1027b5b7-81cf-43b7-93e2-0805e8961990}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('4e38bc53-8db4-4078-aa95-862b3544e5f8', 'RAZ', '25,000 Puffs', '5%', 'ca808e4d-f082-416a-9a96-f9684e06bae4', '{9a088057-37a4-4cac-b0a0-77cec08eab7a}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('aefdb495-1714-401d-8e5b-ae9ec7e60cf0', 'Adjust', '40,000 Puffs', '5%', '6b419dcf-06dd-4ebc-97e1-1d5a5d146199', '{e061445a-b9f9-4d89-99a4-a7dd85594287}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('7cb009ae-c1cc-4dda-afde-7fa057bb6eab', 'Coastal Clouds', '60ml / 30ml', '0mg, 3mg, 6mg, 12mg, 25mg, 50mg', '45c16486-b285-4408-affb-c3eedcf66cf1', '{4a6bb80f-4bf3-49da-8e97-67b6c056926e}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('9e433843-7e2e-4d6b-b519-bef74cc1d2ba', 'Cloud Nurdz', '60ml', '0mg, 3mg, 6mg', 'b471533a-f839-42bf-b8fa-aba24e2790d6', '{b518d22c-da5a-4523-9470-a1e1e7cf60dd}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('fafb156a-3d72-450f-9cfd-daa84d78926c', 'GeekVape', 'Various', '0%', 'cmlaturi5000gw8x1j7r181iz', '{8786b7b7-0b4b-4dbb-bb50-bfbe0f9ba694,b105a925-c604-4734-8484-9fb03830b08c,029c1751-dfd4-46eb-ba99-feba3381f23c,0ede9f35-71a6-48bd-9dbb-9bd2afd9223d,4605ce7d-9dbd-424b-9ce3-f0b49ee451da,603dd3b9-96d0-406f-91c5-cab616f2c350,2462be23-4d10-4da8-8ea1-2e76c375dc31,ad5fefaa-fb46-474e-9b49-9373f8e126da}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('64cc4a4e-c480-4cbb-9595-b965aea68b1b', 'SMOK', 'Various', '0%', 'cmlatvndt000hw8x12ree05l0', '{5e26b446-b621-4033-895f-d5c1704f464c,fa713792-eb20-4344-8fc6-a314990b2bbc,30ca1004-9ecc-4f54-85f4-c0e6fc32a092,c07e75b0-3ef4-454c-ae66-071021d9db9d}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('9197fc0d-ad2b-48c6-8a2b-edb317c46b79', 'Vaporesso', 'Various', '0%', 'cmlatwdpg000iw8x12vxnl0di', '{084ddb3e-b6bd-4b52-9e31-88533aa9f1c6,486cec35-fc1a-4871-89b3-49d04c574bdc}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('2d171fa3-2def-4bc8-a243-80f0fa97fb57', 'Uwell', 'Internal Battery', '0%', 'cmlau1kof000uw8x1aduiumoy', '{95c32782-8403-4d4a-9098-c743989492c9,c642d034-eb62-4885-b032-33da3da3a69e}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('ee892128-e42e-46b6-803f-acc103758b85', 'VOOPOO', 'External Battery', '0%', '19318225-43e2-48a3-b6fe-5a6a296a8877', '{e41e65d0-7377-4708-bedc-ddc2673d8a6e}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('430d6e8b-cac5-40e3-965a-f11236e8fd42', 'Lost Vape', 'External Battery', '0%', '04696c63-43d6-487a-80ca-d3bc632e140c', '{d4d7e181-618d-412d-93f1-aa82b300b742}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('452475da-775b-4d54-b1fc-5bd0a83a8a3c', 'Zig Zag', 'Various', '0%', 'cmlau49d30012w8x1vtsi2unb', '{7fe85cff-0358-479d-9f90-3ff2cbcc017f,a631f905-6b1a-4f5b-b8ec-15b1a1000d0a,4a7d13ec-64e8-439d-b126-7185ecedf8f2,4d79b498-36bf-4d5c-8020-30696a92d240,8cac6af5-d869-405e-a865-1458c5f6334d,9cb3fb76-05e9-41ed-9284-40f7982cd7f3,cfbb6cfb-cb6a-4dcd-9bcc-099f7001c594}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('79bf3628-6a75-4a2f-b042-674956efdb41', 'Raw', 'Natural/Unrefined', '0%', 'cmlau24cj000ww8x1bb7q93zn', '{9046502d-3d2e-4a9d-a441-3dfe2eda6904,15058c0a-5388-4893-bbe2-1076edd4d542,487cb8da-04ed-4812-895c-b2ee9f8616f0,bc3a6ac9-43d2-4876-860a-51b15576ee3b,9a7f9de1-56c7-4084-9774-166fb2107dca}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('c9f54f31-9fe7-49ba-85f7-6330baee678e', 'Elements', 'Rice Paper', '0%', 'cmlau53mh0014w8x1mm126nn1', '{d6e648c1-1bd2-45c1-9cc9-ee105b438b8d,32c05d1b-be0e-43bf-9400-9cdbee052c68,998a6ea9-4a9b-4a35-8576-ce21bfca26e3}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('4b33c088-9862-440e-b150-050d5b4eba1f', 'Blazy Susan', 'Pink Collection', '0%', 'cmlau4l140013w8x1pxrb267k', '{55e97ea7-1d44-466c-8a39-87495d019a8c,70786887-8b64-4da9-bc55-5198ddf5d99a,3e0cbd0c-22ee-44ba-873c-5a4f29ca5bfc,f65bdb18-37ee-46d6-bf66-00e99b81578b,2ed477b4-dbd7-4b9c-adfc-94c9f7a0a4e6}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('36968c17-2405-4c18-b1d9-f9043ea32522', 'Grabba Leaf', 'Whole Leaf', 'Natural Tobacco', 'd128c3e9-05de-4c56-9432-2755e7662677', '{2ea5adee-075c-4e0c-8d3a-6262b3669b6e,098a038e-e70f-4a5f-84af-6ba745b9541f}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('c82fe269-d1f6-4808-9da0-1546ddec963c', 'Pod Juice', '30ml / 60ml / 100ml', '3mg, 6mg, 25mg, 55mg', 'cmlau10l9000sw8x17z85z4pq', '{59003710-15ce-4c7e-b9ab-c0b21b472928}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('706943ae-f187-4a77-a534-1a7c98889513', 'Vapetasia', '30ml / 100ml', '3mg, 6mg, 24mg, 48mg', 'cmlau04wb000qw8x14xicc302', '{bbe5fd0b-fe86-4649-9935-7ef212cf4adc}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('1a498108-3fa8-4e51-bbeb-6054927222d7', 'Innevape', '30ml / 75ml / 100ml', '3mg, 6mg, 24mg, 50mg', 'cmlatzr41000pw8x1fzw3i834', '{dd61e714-da1e-4776-8df2-a1f37a00846b}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('0bb13969-3178-4a7c-be90-6b7804a50645', 'MRKT PLCE', '30ml / 100ml', '3mg, 6mg, 24mg, 48mg', 'cmlatzeye000ow8x18lphwhtu', '{3ed2b978-e5e9-452f-9fa1-837681a2d4ce}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('e085faa4-89fd-42c0-87e6-47588ffdf573', 'Sad Boy', '30ml / 100ml', '3mg, 6mg, 28mg, 48mg', 'cmlatxot6000nw8x1tyaasuof', '{992366de-5f2b-4a71-9cba-d3a5409e3fff}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('b5e88546-f5e7-4b90-9aef-1ac11f325897', 'Monster Series', '30ml / 100ml', '3mg, 6mg, 24mg, 48mg', 'cmlatwv7t000kw8x1sx5jrhxp', '{9346a17f-ba00-4a92-9ed6-9a190940e611}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('18648993-b84a-44a1-aab7-9e6bd37e74bd', 'Naked 100', '30ml / 60ml', '3mg, 6mg, 35mg, 50mg', 'cmlatwn7i000jw8x178a1wxl6', '{dec3965c-4778-47cf-ac88-272313c58beb}', '2026-02-19 17:52:59.082', '2026-02-19 17:52:59.082');
INSERT INTO public."Product" VALUES ('cmlti7fid0002ywx1bgx0gtcu', 'new', 'ad', '32', 'cmlatwv7t000kw8x1sx5jrhxp', '{2462be23-4d10-4da8-8ea1-2e76c375dc31,084ddb3e-b6bd-4b52-9e31-88533aa9f1c6}', '2026-02-19 13:35:37.653', '2026-02-19 13:35:37.653');
INSERT INTO public."Product" VALUES ('cmlv4gpd200016sx1lkj6zei0', '111', '111', '111', 'cmlatwn7i000jw8x178a1wxl6', '{cmlv4g1au00006sx1euvxnc0j}', '2026-02-20 16:46:28.38', '2026-02-20 16:46:28.38');
INSERT INTO public."Product" VALUES ('cmm3ok9s10002y8x1xwnahb6f', 'abcd', 'small, medium', '5mg', 'cmm3oj8f70000y8x1lns8z9m1', '{cmm3ojox80001y8x1yqlnffp3}', '2026-02-26 16:31:16.517', '2026-02-26 16:31:16.517');


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('6f4f2e31-e4fc-4c55-8d7b-c92ba1c78329', '2c76353c177233267e6636e98c908119acb02e2b495d22dd29a8a040cd9cb377', '2026-02-06 17:23:13.190892+05:45', '20260206000000_init_schema', NULL, NULL, '2026-02-06 17:23:13.11421+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('1905c0ea-1170-430a-bfa4-1fdf74918f2c', '731a16476a1fc435eb810925b821c1d1f8729cb6596933e913f8b4dc4f6fa8bd', '2026-02-06 17:23:13.207414+05:45', '20260206112912_brand_has_category', NULL, NULL, '2026-02-06 17:23:13.191939+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('a16d721f-c061-42c1-b882-d066089ae59d', '0b338aa35f6220c4c65d0d8ec733db70ebc5af13d498c8341b5650ab5a411acb', '2026-02-20 23:02:30.422652+05:45', '20260220171730_deal_text_added', NULL, NULL, '2026-02-20 23:02:30.343268+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('1ace9b25-2391-4fcb-9c27-994de8cfdffd', 'cb23e6edbbdcbaf99f47725b8293ff589eeb796f1dd648299e6fe3fac22e1a0c', '2026-02-06 17:23:39.089735+05:45', '20260206113839_latest_brand_has_category', NULL, NULL, '2026-02-06 17:23:39.053332+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('2613c656-6f0c-4e4b-bb49-2782b7f40483', 'adcc3ce650faca922f5055c55774615c3d5f2e7b7e605d179ef3484405c86216', '2026-02-06 18:09:34.815174+05:45', '20260206122434_product_has_brand', NULL, NULL, '2026-02-06 18:09:34.805189+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('0e4ccee3-d2fc-45a0-b207-5198cea1ae23', '075232135f25f3f741ff9b13c34246095f12379664d6e26ffa25b49d1219ae2a', '2026-02-06 18:17:30.67648+05:45', '20260206123230_product_has_flavor', NULL, NULL, '2026-02-06 18:17:30.654032+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('3e958509-a60e-4d8d-bea7-6cbf6b6937c7', '2da072db0fea27592199b9ecc96dbf92a8d007a6b5cb517b22bec05e01787d59', '2026-02-26 22:07:10.438612+05:45', '20260226162210_email_added_in_admin', NULL, NULL, '2026-02-26 22:07:10.227046+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('da68047a-ae3f-47fe-b89b-f5eec7247e87', 'e1e37a2b4072e735f6c05a6ea1746a9a09d1149f0f563fbb32282075a1636d6e', '2026-02-11 15:51:06.774996+05:45', '20260211100606_add_model_table_remove_flavor', NULL, NULL, '2026-02-11 15:51:06.614023+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('2b9e5017-6d4b-4948-9f20-9390d8f16c1e', 'e2352a270f0b0e7c21df3d7f48579bf4fde74335d8de859045bf7617dcab345f', '2026-02-11 16:00:51.830707+05:45', '20260211101551_add_model_fields_and_remove_flavor', NULL, NULL, '2026-02-11 16:00:51.800255+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('53984d2a-6a99-4394-8bc5-76842d048dfc', '0144479bbc5d5102dd7dd985b3bea33bcedfef721c3e2190958448d0c3ea3299', '2026-02-11 16:08:22.884505+05:45', '20260211102322_add_model_fields_and_remove_flavor', NULL, NULL, '2026-02-11 16:08:22.877618+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('12775c74-25b7-488e-8cc0-d14d6f282152', 'a45cdbd75f9772f83671a3cb4b5d34438c56c5d3438b41fbde8845e131b6067b', '2026-02-11 16:13:16.454809+05:45', '20260211102816_use_model_ids_on_product', NULL, NULL, '2026-02-11 16:13:16.440187+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('5c133888-fb99-4940-bc55-69c710ac2d11', '428a5f012a7c584a260b59e09caf745880d87fc9c1fa5e3d8865e79e772dfcdc', '2026-02-19 14:21:16.425422+05:45', '20260219083615_add_message_and_newsletter_models', NULL, NULL, '2026-02-19 14:21:15.326127+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('0f5dd1a7-529a-47b1-8b33-688d34eebf67', 'caa4e0156100b2f04bb52f552812b01cd7b087d00b01a5d67cc3813567d15cf1', '2026-02-19 15:42:26.128986+05:45', '20260219095725_add_admin_model', NULL, NULL, '2026-02-19 15:42:25.907563+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('b5d79314-0acc-4a73-a10c-922a5605f813', '56c960bfe3f2f232f6321f17b3a487022255c56d3f67e9242b7daaf3697eec14', '2026-02-19 17:52:59.104983+05:45', '20260219120759_add_created_at_updated_at', NULL, NULL, '2026-02-19 17:52:59.077004+05:45', 1);
INSERT INTO public._prisma_migrations VALUES ('0a3ca12a-70f7-4683-8dbf-9ca5fd24b0a7', 'ce8bb18fc8fc7b84df705439722658d27f594232ef5094c3d953e5d60d62f3fd', '2026-02-19 18:18:35.017055+05:45', '20260219123334_slug_removed', NULL, NULL, '2026-02-19 18:18:34.997193+05:45', 1);


--
-- Name: Message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Message_id_seq"', 2, true);


--
-- Name: NewsletterSubscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."NewsletterSubscription_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--

\unrestrict eyurXZDAw4T2XzFVA0Xn5EM4ueYr5hSsAVhgOFpXyKgb9H6n8VqzTOKGirXIH6k

