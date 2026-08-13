FROM eclipse-temurin:21-jdk

WORKDIR /app

# Pobieramy zależności podczas budowania obrazu, żeby kolejne uruchomienia
# nie musiały robić tego ponownie.
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY . .

EXPOSE 8090
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]
