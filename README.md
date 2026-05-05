# Nasza Wspólna Opowieść ❤️

Piękna, interaktywna galeria wspomnień stworzona dla par. Pozwala przechowywać wspólne zdjęcia, śledzić czas trwania związku, planować listę marzeń (Bucket List) oraz słuchać Waszej ulubionej piosenki.

## Funkcje
- 📸 **Galeria Wspomnień**: Dodawanie zdjęć z opisami i datami.
- ⏳ **Licznik Czasu**: Dynamiczne odliczanie lat, miesięcy i dni razem.
- ✨ **Lista Marzeń**: Planowanie wspólnych przygód.
- 🎵 **Muzyka**: Integracja z Spotify.
- 🔒 **Prywatność**: Dostęp chroniony datą rozpoczęcia związku (hasło).
- ⚙️ **Personalizacja**: Możliwość zmiany imion, zdjęć profilowych i daty z poziomu aplikacji.

## Technologia
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend (Opcjonalnie)**: PHP + SQLite / Node.js + Express
- **Ikony**: Lucide React

## Instalacja
1. Skopiuj repozytorium.
2. Zainstaluj zależności: `npm install`.
3. Uruchom wersję deweloperską: `npm run dev`.
4. Budowanie wersji produkcyjnej: `npm run build`.

## Konfiguracja (Deployment)
Projekt zawiera plik `api.php`, który można wgrać na dowolny hosting obsługujący PHP i SQLite. Wszystkie dane są zapisywane w lokalnej bazie `lovestory.sqlite`.

### AI Story Generation (Gemini)
Aplikacja wykorzystuje model Gemini AI do generowania podsumowań Waszych wspomnień.
1. Pobierz darmowy klucz API z [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Otwórz plik `api.php` i wstaw swój klucz w zmiennej `$GEMINI_API_KEY`.
3. Jeśli używasz wersji deweloperskiej (Node.js), dodaj klucz do pliku `.env` jako `GEMINI_API_KEY=twoj_klucz`.

---
Stworzone z miłością.
