# Etapa de compilación
FROM maven:3.9.8-amazoncorretto-21 AS build
WORKDIR /app

# Copiamos el POM del padre y el microservicio
COPY pom.xml ./pom.xml
COPY src ./src

RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM amazoncorretto:21-alpine3.17
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "app.jar"]