FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests


FROM openjdk:17-jdk-slim
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

RUN apt-get update && apt-get install -y --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]