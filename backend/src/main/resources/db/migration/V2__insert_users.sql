-- Usuario administrador inicial pass:olaola
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$8C43gbSZvDyNJTkcHeHLwuOtPWQtKhefOcyP3ggzfkEuyvBU.H1aa', 'ADMIN');

-- Usuario usuario inicial pass:olaola
INSERT INTO users (username, password, role)
VALUES ('user', '$2a$10$B6yDBOOgU.I4EkN5l.8Wb.qECijAj6OReE6PDW25U7b2SzsOUdiiC', 'USER');
