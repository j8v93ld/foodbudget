## Wprowadzenie i założenia projektu

Nasz zespół podjął się stworzenia aplikacji FoodBudget, której celem jest pomoc użytkownikom w efektywnym zarządzaniu budżetem żywieniowym. W dzisiejszych czasach, gdy ceny produktów spożywczych stale rosną, zarządzanie wydatkami na żywność staje się coraz większym wyzwaniem dla wielu gospodarstw domowych. Nasza aplikacja stanowi odpowiedź na ten problem, oferując narzędzia do śledzenia, analizy i optymalizacji wydatków na żywność.

### Główne założenia projektu:

1. **Prywatność przede wszystkim** - dane użytkownika pozostają wyłącznie na jego urządzeniu, bez konieczności przesyłania ich na serwer
2. **Łatwość użycia** - intuicyjny interfejs, który nie wymaga specjalistycznej wiedzy
3. **Automatyzacja** - wykorzystanie sztucznej inteligencji do analizy paragonów i generowania rekomendacji
4. **Dostęp bez rejestracji** - aplikacja dostępna natychmiast, bez potrzeby tworzenia konta

### Główne funkcjonalności MVP:

- Ustawianie miesięcznego budżetu na żywność z możliwością określenia daty jego odnowienia
- Ręczne wprowadzanie wydatków z kategoryzacją
- Skanowanie paragonów z użyciem AI (OpenAI GPT-4o)
- Wizualizacja wydatków w formie wykresów i statystyk
- Prognozowanie wydatków do końca okresu rozliczeniowego
- Generowanie spersonalizowanych rekomendacji oszczędnościowych
- Eksport i import danych w formacie JSON

Aplikacja FoodBudget została zaprojektowana jako rozwiązanie typu "Privacy-First", co oznacza, że wszystkie dane są przechowywane lokalnie w przeglądarce użytkownika, bez konieczności rejestracji czy przesyłania danych na zewnętrzne serwery. Jedynym wyjątkiem są zapytania do API sztucznej inteligencji, które są niezbędne do analizy paragonów i generowania rekomendacji.

## Wdrożenie projektu na serwerze Ubuntu

### Wymagania wstępne:

- Serwer Ubuntu z dostępem root
- Node.js w wersji 14 lub wyższej
- npm
- Git (opcjonalnie)

### Kroki instalacji:

1. **Zaloguj się do serwera** za pomocą SSH:
    
    ```bash
    ssh użytkownik@adres_ip_serwera
    
    ```
    
2. **Zainstaluj Node.js i npm** (jeśli nie są zainstalowane):
    
    ```bash
    # Zainstaluj nvm (Node Version Manager)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    
    # Załaduj nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # Zainstaluj Node.js 18
    nvm install 18
    
    ```
    
3. **Stwórz katalog dla projektu i skopiuj pliki:**
    
    ```bash
    mkdir -p ~/foodbudget
    
    ```
    
    Na tym etapie prześlij rozpakowane pliki projektu na serwer. Możesz użyć narzędzia SCP, SFTP lub przekopiować zawartość pliku zip za pomocą narzędzi do transferu plików.
    
4. **Zainstaluj zależności:**
    
    ```bash
    # Przejdź do katalogu projektu
    cd ~/foodbudget
    
    # Zainstaluj zależności głównego projektu
    npm install
    
    # Przejdź do katalogu klienta i zainstaluj jego zależności
    cd client
    npm install
    cd ..
    
    ```
    
5. **Skonfiguruj zmienne środowiskowe:**
    
    ```bash
    # Utwórz plik .env w katalogu server
    touch server/.env
    
    ```
    
    Otwórz plik `server/.env` w edytorze i dodaj:
    
    ```
    # OpenAI API Key
    OPENAI_API_KEY=sk-twoj-klucz-api
    
    # Port dla serwera Node.js
    PORT=5000
    
    # Środowisko
    NODE_ENV=production
    
    ```
    
6. **Zbuduj wersję produkcyjną aplikacji React:**
    
    ```bash
    cd client
    npm run build
    cd ..
    
    ```
    
7. **Uruchom aplikację, aby była dostępna pod adresem IP serwera:**
    
    ```bash
    # Przejdź do katalogu klienta
    cd client
    
    # Uruchom serwer React na porcie 3000 z opcją dostępu z zewnątrz
    npm start -- --host 0.0.0.0
    
    ```
    
8. **W osobnym terminalu uruchom backend:**
    
    ```bash
    # Przejdź do katalogu projektu
    cd ~/foodbudget
    
    # Uruchom backend
    node server/index.js
    
    ```
    
9. **Skonfiguruj trwałe uruchomienie (aby działało po zamknięciu terminala):**
    
    ```bash
    # Zainstaluj pm2 globalnie
    npm install -g pm2
    
    # Uruchom backend jako usługę
    pm2 start server/index.js --name "foodbudget-backend"
    
    # Uruchom frontend jako usługę (jeśli chcesz serwować wersję produkcyjną)
    cd client
    pm2 serve build 3000 --spa --name "foodbudget-frontend"
    
    # Zapisz konfigurację pm2
    pm2 save
    
    # Skonfiguruj automatyczne uruchamianie przy starcie systemu
    pm2 startup
    
    ```
    
10. **Aplikacja powinna być teraz dostępna** pod adresem `http://ip_serwera:3000`

### Opcjonalnie: Konfiguracja serwera proxy dla lepszego dostępu

Jeśli chcesz, aby aplikacja była dostępna na standardowym porcie 80 lub poprzez domenę, możesz skonfigurować Nginx jako serwer proxy:

```bash
# Zainstaluj Nginx
sudo apt-get update
sudo apt-get install nginx

# Skonfiguruj wirtualny host
sudo nano /etc/nginx/sites-available/foodbudget

```

Dodaj następującą konfigurację:

```
server {
    listen 80;
    server_name twój_adres_ip_lub_domena;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

```

Aktywuj konfigurację i zrestartuj Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/foodbudget /etc/nginx/sites-enabled/
sudo nginx -t  # sprawdź konfigurację
sudo systemctl restart nginx

```

Teraz aplikacja powinna być dostępna pod adresem `http://twój_adres_ip_lub_domena` bez konieczności podawania portu.
