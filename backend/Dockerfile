# Stage 1: Build JAR using Maven
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime JRE
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create volume mount point for file uploads
RUN mkdir -p /app/uploads
VOLUME /app/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
