# Share a meal API

Dit is het project dat gemaakt is voor het vak Programmeren 4 voor de opleiding informatica aan de Avans Hogeschool in Breda.

[![Deploy to Heroku](https://github.com/rickvloon/p4_resultaat_1/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/rickvloon/p4_resultaat_1/actions/workflows/main.yml)

## Omschrijving
**De casus van deze opdracht is als volgt**:
Om de sociale verbinding tussen mensen te versterken is het idee ontstaan om het gezamenlijk delen van een maaltijd gemakkelijker te maken. Om een project als dit haalbaar te houden en om de potentie ervan te onderzoeken is gekozen om op kleine schaal te beginnen.

Dit project is een server die op nodejs draait en persistent data opslaat door middel van een MySQL database.
Het bevat de volgende functionaliteiten:
1. Authenticate
    - Een gebruiker kan inloggen via een emailadress en wachtwoord.
2. Gebruikers
    - Er kan een nieuwe gebruiker worden aangemaakt.
    - Alle gebruikers kunnen worden opgevraagd.
    - Het profiel van een specifieke gebruiker kan worden opgevraagd.
    - Een specifieke gebruiker kan worden opgevraagd.
    - Een gebruiker kan worden aangepast.
    - Een gebruiker kan worden verwijderd.
3. Maaltijden
    - Er kan een nieuwe maaltijd worden aangemaakt.
    - Alle maaltijden kunnen worden opgevraagd.
    - Een specifieke maaltijd kan worden opgevraagd.
    - Een maaltijd kan worden aangepast.
    - Een maaltijd kan worden verwijderd.
    - Een gebruiker kan zich in- en uitschrijven voor een maaltijd.

## Installatie
Voer de volgende commands achtereenvolgens uit in je cmd:
```
git clone https://github.com/rickvloon/p4_resultaat_1.git
npm install
npm run start
```

## Testen
Na het volgen van de installatie procedure kunnen de voorbestaande tests uitgevoerd worden door:
```
npm run test
```

## Auteurs
Rick van Loon - 2185599