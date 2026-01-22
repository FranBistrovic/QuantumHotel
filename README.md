# Quantum Hotel

# Opis projekta
Ovaj projekt je rezultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.

S obzirom na brzi razvoj tehnologije i rast očekivanja gostiju, hoteli se suočavaju s izazovima u vođenju evidencije rezervacija, optimizaciji zauzeća i komunikaciji s gostima. Trenutne metode upravljanja često dovode do preklapanja rezervacija, nesigurnosti u cijene i nedostatka transparentnosti. Također, ručno upravljanje podacima može uzrokovati pogreške i povećati operativni stres.

Za rješavanje tih problema razvijen je projekt Quantum Hotel. Ovaj sustav omogućava centralizirano upravljanje svim informacijama o hotelu - od raspoloživih soba i cijena do dodatnih usluga, čime se poboljšava učinkovitost poslovanja. Gostima nudi jednostavnu online rezervaciju, dok hotelu omogućuje bolji uvid u zauzeće i optimizaciju resursa. Aplikacija je osmišljena tako da bude jednostavna za korištenje, sigurna i brza, čime se poboljšava iskustvo kako gostiju, tako i zaposlenika, te omogućuje lakše donošenje poslovnih odluka na temelju podataka.

Osim toga, sustav podržava integraciju s vanjskim uslugama kao što su Google Maps za preciznu lokaciju hotela i naprednu statistiku za bolje planiranje i donošenje poslovnih odluka. Kroz jednostavno sučelje i automatizirane funkcionalnosti, Quantum Hotel poboljšava operativnu efikasnost i omogućuje bolju konkurentnost na tržištu.

# Funkcijski zahtjevi
Aplikacija Quantum Hotel sadrži početnu stranicu koja korisnicima omogućuje jednostavan pristup prijavi i pregledu hotelske ponude. Prijava je implementirana ili putem Google računa korištenjem OAuth2 autentifikacije ili putem vlastitog korisničkog računa nakon registracije, čime je osigurana visoka razina sigurnosti i jednostavnosti za korisnike.

Korisnici, ovisno o svojoj dodijeljenoj ulozi, imaju različite mogućnosti unutar sustava:

Gost: Može pregledavati dostupne smještajne jedinice, birati željeni termin i broj osoba te izvršiti rezervaciju. Sustav nudi opciju odabira dodatnih hotelskih usluga poput doručka, parkiranja ili wellness sadržaja. Automatizirana logika sustava provjerava dostupnost soba u stvarnom vremenu i onemogućuje preklapanje rezervacija.

Djelatnik: Ima ovlasti za unos i ažuriranje podataka o sobama, kategorijama smještaja i dodatnim uslugama. Također, djelatnici imaju pristup pregledu i potvrdi svih pristiglih rezervacija.

Administrator: Posjeduje pune ovlasti nad sustavom, uključujući upravljanje korisničkim računima i ulogama. Ključna funkcija administratora je generiranje i analiza statističkih podataka o poslovanju, uz mogućnost preuzimanja izvještaja u standardiziranim formatima (PDF, XML i XLSX).

Na stranici je integrirana Google Maps usluga koja omogućuje precizan prikaz lokacije hotela i obližnjih sadržaja. Korisnicima su dostupni informativni članci o dodatnim aktivnostima i ponudi hotela, a cijelo je sučelje dizajnirano da bude pregledno i intuitivno.

Svi podaci o korisnicima, rezervacijama i uslugama pohranjeni su u centraliziranu bazu podataka. Sustav je u potpunosti operativan, siguran i dizajniran za stalnu dostupnost.

# Tehnologije
- **Dokumentacija:** GitHub Wiki, Astah UML, draw.io, PlantUML, dbdiagram.io
- **Frontend:** React (Next.js), JavaScript, HTML/CSS
- **Backend:** Java, Spring Boot
- **Baza:** PostgreSQL (modeliranje: ERDplus)
- **Infrastruktura/Deploy:** Docker + docker-compose, Nginx (reverse proxy), AWS EC2
- **Integracije:** Google Maps
- **Razvojni alati:** IntelliJ IDEA
- **Testiranje:** Spring Boot Test, Mockito, Selenium
- **Version control:** Git, GitHub
- **Komunikacija/alat:** WhatsApp, Discord
- **AI alati:** ChatGPT, Gemini, Claude

# Članovi tima
[Fran Bistrović](https://github.com/FranBistrovic)  
[Dina Janđel](https://github.com/dina-jandel)  
[Nina Jurić](https://github.com/Nina-Juric)  
[Lukas Kraljić](https://github.com/lukas-kraljic)  
[Marko Majstorović](https://github.com/marko-majstorovic)  
[Marija Špoljarić](https://github.com/marija-spoljaric)  
[Matija Tušek](https://github.com/matija-tusek)  

# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf).  
Dodatni naputci za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).  
Očekuje se poštivanje [etičkog kodeksa IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeksa ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.
 
>###  Prijava problema
>Najgore što se može dogoditi je da netko šuti kad postoje problemi. Postoji nekoliko stvari koje možete učiniti kako biste najbolje riješili sukobe i probleme:
>* Obratite mi se izravno [e-pošta](mailto:vlado.sruk@fer.hr) i  učinit ćemo sve što je u našoj moći da u punom povjerenju saznamo koje korake trebamo poduzeti kako bismo riješili problem.
>* Razgovarajte s vašim asistentom jer ima najbolji uvid u dinamiku tima. Zajedno ćete saznati kako riješiti sukob i kako izbjeći daljnje utjecanje u vašem radu.
>* Ako se osjećate ugodno neposredno razgovarajte o problemu. Manje incidente trebalo bi rješavati izravno. Odvojite vrijeme i privatno razgovarajte s pogođenim članom tima te vjerujte u iskrenost.

# 📝 Licenca
Ovaj projekt je licenciran pod [MIT Licencom](https://github.com/FranBistrovic/QuantumHotel/blob/main/LICENSE).
