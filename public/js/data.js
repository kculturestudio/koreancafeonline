/* Zawartość kawiarni: czaty, roomy, wydarzenia i przykładowe wiadomości.
   Edytuj ten plik, żeby zmieniać listy bez dotykania reszty kodu.

   Pola wspólne:
   - lang:   'KR' (ćwiczenie koreańskiego), 'PL' (ćwiczenie polskiego), 'MIX' (oba języki)
   - levels: poziomy, dla których pozycja pasuje do filtra
   - topic:  'language' | 'culture' | 'life' | 'dance'
   - ages:   grupy wiekowe do filtra: '18-25', '26-35', '36+'
   Godziny roomów i wydarzeń podajesz w czasie warszawskim (time, dow: 0 = niedziela ... 6 = sobota);
   strona sama przelicza je na czas koreański i uwzględnia zmianę czasu. */
(function () {
  var ALL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  var ALL_AGES = ['18-25', '26-35', '36+'];
  var EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];

  window.KCO_DATA = {
    channels: [
      {
        id: 'kr-a1', badge: 'KR', lang: 'KR', topic: 'language', premium: false,
        levels: ['A1'], level: { pl: 'A1', ko: 'A1' }, ages: ALL_AGES,
        name: { pl: 'Koreański dla początkujących', ko: '한국어 초급' },
        desc: { pl: 'pisz po koreańsku', ko: '한국어로 써 보세요' },
        rule: { pl: 'Pisz po koreańsku, native speakerzy poprawiają.', ko: '한국어로 써 보세요. 원어민이 고쳐 드려요.' },
        // Pytania do ćwiczeń (karta nad wiadomościami): k = pytanie po koreańsku, pl = tłumaczenie, starter = początek odpowiedzi.
        practice: [
          { pl: 'Jak się nazywasz?', k: '이름이 뭐예요?' },
          { pl: 'Ile masz lat?', k: '몇 살이에요?' },
          { pl: 'Dlaczego uczysz się koreańskiego?', k: '왜 한국어를 공부해요?' },
          { pl: 'Jakie jest Twoje hobby?', k: '취미가 뭐예요?' },
          { pl: 'Jaka dziś jest pogoda?', k: '오늘 날씨가 어때요?' },
          { pl: 'Co robiłeś(-aś) w tym tygodniu?', k: '이번 주에 뭐 했어요?' },
          { pl: 'Co będziesz robić w przyszłym tygodniu?', k: '다음 주에 뭐 할 거예요?' },
          { pl: 'Jakie jest Twoje ulubione koreańskie jedzenie?', k: '제일 좋아하는 한국 음식이 뭐예요?' },
          { pl: 'Czy byłeś(-aś) kiedyś w Korei?', k: '한국에 가 본 적 있어요?' },
          { pl: 'Czy lubisz podróżować?', k: '여행을 좋아해요?' },
          { pl: 'Z jakiego kraju jesteś?', k: '어느 나라 사람이에요?' },
          { pl: 'Jak długo uczysz się koreańskiego?', k: '한국어를 얼마나 공부했어요?' },
          { pl: 'Jaki jest Twój ulubiony kolor?', k: '좋아하는 색깔이 뭐예요?' },
          { pl: 'Jaka jest Twoja ulubiona pora roku?', k: '좋아하는 계절이 뭐예요?' },
          { pl: 'Co zwykle robisz w weekend?', k: '주말에 보통 뭐 해요?' },
          { pl: 'Co ostatnio lubisz?', k: '요즘 무엇을 좋아해요?' },
          { pl: 'Jakiej muzyki lubisz słuchać?', k: '어떤 음악을 좋아해요?' },
          { pl: 'Kto jest Twoim ulubionym piosenkarzem lub piosenkarką?', k: '좋아하는 가수가 누구예요?' },
          { pl: 'Jaki jest Twój ulubiony film?', k: '좋아하는 영화가 뭐예요?' },
          { pl: 'Jaki jest Twój ulubiony serial?', k: '좋아하는 드라마가 뭐예요?' },
          { pl: 'Jakie jest Twoje ulubione zwierzę?', k: '좋아하는 동물이 뭐예요?' },
          { pl: 'Wolisz koty czy psy?', k: '고양이와 강아지 중에서 무엇을 더 좋아해요?' },
          { pl: 'Wolisz poranki czy wieczory?', k: '아침을 좋아해요, 저녁을 좋아해요?' },
          { pl: 'Lubisz ostre jedzenie?', k: '매운 음식을 좋아해요?' },
          { pl: 'Wolisz kawę czy herbatę?', k: '커피를 좋아해요, 차를 좋아해요?' },
          { pl: 'Czy jest kraj, który chciał(a)byś odwiedzić?', k: '가고 싶은 나라가 있어요?' },
          { pl: 'Jakich koreańskich potraw próbowałeś/próbowałaś?', k: '한국 음식 중에서 무엇을 먹어 봤어요?' },
          { pl: 'Czy masz ulubione koreańskie słowo?', k: '한국어에서 좋아하는 단어가 있어요?' },
          { pl: 'Czy koreański jest trudny?', k: '한국어가 어려워요?' },
          { pl: 'Jak się dziś czujesz?', k: '오늘 기분이 어때요?' },
          { pl: 'Co robiłeś/robiłaś dzisiaj?', k: '오늘 뭐 했어요?' },
          { pl: 'Gdzie teraz mieszkasz?', k: '지금 어디에 살아요?' },
          { pl: 'Skąd pochodzisz?', k: '고향이 어디예요?' },
          { pl: 'Ile osób liczy Twoja rodzina?', k: '가족이 몇 명이에요?' },
          { pl: 'Czy masz rodzeństwo?', k: '형제자매가 있어요?' },
          { pl: 'Chodzisz do szkoły czy pracujesz?', k: '학교에 다녀요, 회사에 다녀요?' },
          { pl: 'Czym się zajmujesz?', k: '무슨 일을 해요?' },
          { pl: 'Czy masz przyjaciela lub przyjaciółkę, z którym/którą często się spotykasz?', k: '자주 만나는 친구가 있어요?' },
          { pl: 'Co zwykle robisz z przyjaciółmi?', k: '친구와 보통 뭐 해요?' },
          { pl: 'Czy masz ulubione miejsce?', k: '좋아하는 장소가 있어요?' },
        ]
      },
      {
        id: 'kr-adv', badge: 'KR', lang: 'KR', topic: 'language', premium: false,
        levels: ['B1', 'B2', 'C1', 'C2'], level: { pl: 'B1–C2', ko: 'B1–C2' }, ages: ALL_AGES,
        name: { pl: 'Koreański na poziomie zaawansowanym', ko: '한국어 고급 수준' },
        desc: { pl: 'pytania do głębszych rozmów', ko: '깊이 있는 대화 질문' },
        rule: { pl: 'Pisz po koreańsku, native speakerzy poprawiają.', ko: '한국어로 써 보세요. 원어민이 고쳐 드려요.' },
        // 40 pytań do rozmów (prompt nad polem wiadomości): k = pytanie po koreańsku, pl = tłumaczenie. Bez pola starter, więc bez przycisku "Odpowiedz".
        practice: [
          { pl: 'Gdyby Twoje życie było koreańskim serialem, jaki miałoby tytuł?', k: '내 인생이 드라마라면 제목이 뭐예요?' },
          { pl: 'Gdybyś miał(a) wybrać jedną piosenkę jako soundtrack swojego życia, co by to było?', k: '내 인생의 배경 음악을 하나 고른다면 어떤 노래를 고를 거예요?' },
          { pl: 'Czyje życie chciał(a)byś przeżyć przez jeden dzień?', k: '다른 사람의 인생을 하루 동안 살아 볼 수 있다면 누구의 인생을 살아 보고 싶어요?' },
          { pl: 'Jak brzmiałoby pierwsze zdanie książki o Twoim życiu?', k: '내 인생을 책으로 쓴다면 첫 문장은 뭐예요?' },
          { pl: 'Co napisałaby Ci przyszła wersja Ciebie?', k: '미래의 내가 지금의 나에게 메시지를 보낸다면 뭐라고 할까요?' },
          { pl: 'Gdyby Twoja osobowość była potrawą, czym byś był(a)?', k: '내 성격을 음식으로 표현한다면 어떤 음식일까요?' },
          { pl: 'Co ludzie najczęściej błędnie zakładają o Tobie przy pierwszym spotkaniu?', k: '사람들이 나를 처음 만났을 때 가장 많이 오해하는 점은 뭐예요?' },
          { pl: 'Czy masz jakiś dziwny nawyk, o którym nikt nie wie?', k: '아무도 모르는 나만의 이상한 습관이 있어요?' },
          { pl: 'Czyje myśli chciał(a)byś czytać przez jeden dzień?', k: '하루 동안 다른 사람의 생각을 읽을 수 있다면 누구의 생각을 읽고 싶어요?' },
          { pl: 'Gdybyś był(a) uroczą postacią-zwierzakiem, jakim zwierzęciem byś był(a)?', k: '내가 귀여운 동물 캐릭터라면 어떤 동물일 것 같아요?' },
          { pl: 'Gdybyś mógł/mogła zaktualizować jedną cechę swojej osobowości, co byś zmienił(a)?', k: '내 성격에서 하나만 업데이트할 수 있다면 무엇을 바꾸고 싶어요?' },
          { pl: 'Jakie trzy emoji najlepiej Cię opisują?', k: '나를 설명하는 이모티콘 세 개는 뭐예요?' },
          { pl: 'Gdybyś był(a) czarnym charakterem, dlaczego chciał(a)byś przejąć władzę nad światem?', k: '내가 악당이라면 세상을 지배하려는 이유는 뭐예요?' },
          { pl: 'Jak myślisz, jak wyglądałoby życie Twojej wersji z równoległego świata?', k: '평행 세계에 있는 나는 어떤 삶을 살고 있을까요?' },
          { pl: 'Do jakiego momentu w przeszłości chciał(a)byś wrócić?', k: '과거의 한 순간으로 돌아갈 수 있다면 언제로 돌아가고 싶어요?' },
          { pl: 'Co chciał(a)byś zobaczyć, gdybyś mógł/mogła zajrzeć w przyszłość tylko raz?', k: '미래를 딱 한 번 볼 수 있다면 무엇을 알고 싶어요?' },
          { pl: 'Jak chciał(a)byś spędzić rok, gdybyś nie musiał(a) martwić się o pieniądze?', k: '돈 걱정 없이 1년 동안 살 수 있다면 어떻게 살고 싶어요?' },
          { pl: 'W jakim kraju chciał(a)byś obudzić się jutro rano?', k: '내일 아침 다른 나라에서 눈을 뜬다면 어느 나라였으면 좋겠어요?' },
          { pl: 'Które wspomnienie chciał(a)byś ponownie obejrzeć jak film?', k: '지금까지의 기억 중 하나를 영화처럼 다시 볼 수 있다면 어떤 순간을 보고 싶어요?' },
          { pl: 'Gdyby w Twoim życiu ukryto sekretną misję, na czym by polegała?', k: '내 인생에 숨겨진 비밀 퀘스트가 있다면 어떤 퀘스트일까요?' },
          { pl: 'Co zrobił(a)byś jako pierwsze, gdyby Twój bias został Twoim przyjacielem?', k: '최애가 내 친구가 된다면 가장 먼저 뭘 하고 싶어요?' },
          { pl: 'Dokąd chciał(a)byś pójść ze swoim biasem, gdybyście mogli spędzić razem jeden dzień?', k: '최애와 하루 동안 시간을 보낼 수 있다면 어디에 가고 싶어요?' },
          { pl: 'Co zmienił(a)byś jako pierwsze, gdybyś został(a) menedżerem zespołu K-popowego?', k: '내가 K-pop 그룹의 매니저라면 가장 먼저 무엇을 바꾸고 싶어요?' },
          { pl: 'Gdyby Twoje życie było koncepcją comebacku, jaki miałoby motyw?', k: '내 인생이 컴백 콘셉트라면 어떤 콘셉트일까요?' },
          { pl: 'Która piosenka Twojego ulubionego artysty najlepiej opisuje Twoje życie?', k: '최애의 노래 중 내 인생을 가장 잘 표현하는 노래는 뭐예요?' },
          { pl: 'Gdzie wolał(a)byś mieszkać przez miesiąc: w Seulu czy w innym koreańskim mieście? Dlaczego?', k: '한국에서 한 달 동안 살아야 한다면 서울과 다른 도시 중 어디를 고를 거예요?' },
          { pl: 'Gdybyś znał(a) perfekcyjnie koreański, ale mógł/mogła używać tylko jednego wyrażenia, które byś wybrał(a)?', k: '한국어를 완벽하게 할 수 있지만 한 가지 한국어 표현만 쓸 수 있다면 어떤 표현을 고를 거예요?' },
          { pl: 'Co jest dla Ciebie najważniejsze, kiedy się z kimś zaprzyjaźniasz?', k: '누군가와 친해질 때 가장 중요하게 생각하는 것은 뭐예요?' },
          { pl: 'Jaki drobny gest potrafi Cię wzruszyć?', k: '어떤 작은 행동에 감동을 받아요?' },
          { pl: 'Co chciał(a)byś, żeby inni o Tobie wiedzieli?', k: '사람들이 나에 대해 알아줬으면 하는 점은 뭐예요?' },
          { pl: 'Jakie pierwsze wrażenie chcesz wywierać na innych?', k: '처음 만난 사람에게 어떤 인상을 남기고 싶어요?' },
          { pl: 'Czy potrafisz zaprzyjaźnić się z osobą o zupełnie innym charakterze?', k: '나와 완전히 다른 성격의 사람과 친해질 수 있어요?' },
          { pl: 'Czy jest coś, co dla innych jest drobiazgiem, ale dla Ciebie ma szczególne znaczenie?', k: '다른 사람에게는 사소하지만 나에게는 특별한 것이 있어요?' },
          { pl: 'Co powiedziałaby Ci Twoja dziecięca wersja, gdyby mogła Cię teraz spotkać?', k: '어렸을 때의 내가 지금의 나를 만나면 뭐라고 할까요?' },
          { pl: 'Jakie słowa są Ci teraz najbardziej potrzebne?', k: '지금의 나에게 꼭 필요한 말은 뭐예요?' },
          { pl: 'Co lubią inni, a Ty za tym nie przepadasz?', k: '다른 사람들은 좋아하지만 나는 별로 좋아하지 않는 것은 뭐예요?' },
          { pl: 'Co uważasz za ważniejsze od sukcesu?', k: '성공보다 더 중요하다고 생각하는 것은 뭐예요?' },
          { pl: 'Jaką osobą chciał(a)byś zostać zapamiętany(a)?', k: '사람들이 나를 어떤 사람으로 기억했으면 좋겠어요?' },
          { pl: 'Co wybrał(a)byś ponownie tak samo, nawet gdybyś mógł/mogła zacząć od nowa?', k: '다시 선택할 수 있어도 똑같이 선택할 것 같은 것은 뭐예요?' },
          { pl: 'Gdybyś mógł/mogła nauczyć się po jednej rzeczy od każdej osoby poznanej dziś, czego chciał(a)byś się nauczyć?', k: '오늘 만난 사람들에게서 하나씩 배울 수 있다면 무엇을 배우고 싶어요?' }
        ]
      },
      {
        id: 'pl-b1', badge: 'PL', lang: 'PL', topic: 'language', premium: false,
        levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], level: { pl: 'A1–C2', ko: 'A1–C2' }, ages: ALL_AGES,
        name: { pl: 'Rozmowy po polsku', ko: '폴란드어 대화' },
        desc: { pl: 'dla Koreańczyków', ko: '한국분들을 위한 방' },
        rule: { pl: 'Pisz po polsku, native speakerzy poprawiają.', ko: '폴란드어로 써 보세요. 원어민이 고쳐 드려요.' },
        // 50 pytań "ICE BREAKER – poznajmy się" (A1–B2): pl = pytanie po polsku (główne), k = tłumaczenie po koreańsku. Prompt nad polem wiadomości.
        practice: [
          { pl: 'Jak masz na imię?', k: '이름이 뭐예요?' },
          { pl: 'Ile masz lat?', k: '몇 살이에요?' },
          { pl: 'Skąd pochodzisz?', k: '어디에서 왔어요?' },
          { pl: 'Gdzie teraz mieszkasz?', k: '지금 어디에 살아요?' },
          { pl: 'Jakie znasz języki?', k: '어떤 언어를 할 수 있어요?' },
          { pl: 'Czym się zajmujesz? Uczysz się czy pracujesz?', k: '무슨 일을 해요? 공부해요, 아니면 일해요?' },
          { pl: 'Jakie masz hobby?', k: '취미가 뭐예요?' },
          { pl: 'Jaka jest Twoja ulubiona potrawa?', k: '가장 좋아하는 음식이 뭐예요?' },
          { pl: 'Jakiej muzyki lubisz słuchać?', k: '어떤 음악을 듣는 것을 좋아해요?' },
          { pl: 'Masz rodzeństwo?', k: '형제자매가 있어요?' },
          { pl: 'Czy byłeś/byłaś kiedyś w Polsce?', k: '폴란드에 와 본 적이 있어요?' },
          { pl: 'Czy byłeś/byłaś kiedyś w Korei Południowej?', k: '한국에 가 본 적이 있어요?' },
          { pl: 'W jakich krajach już byłeś/byłaś?', k: '어느 나라들에 가 봤어요?' },
          { pl: 'Który kraj najbardziej Ci się podobał?', k: '어느 나라가 가장 마음에 들었어요?' },
          { pl: 'Do jakiego kraju chciał(a)byś pojechać?', k: '어느 나라에 가 보고 싶어요?' },
          { pl: 'Jakie miasto najbardziej chciał(a)byś odwiedzić?', k: '어떤 도시에 가장 가 보고 싶어요?' },
          { pl: 'Wolisz podróżować sam(a) czy z innymi osobami?', k: '혼자 여행하는 것을 좋아해요, 아니면 다른 사람들과 여행하는 것을 좋아해요?' },
          { pl: 'Jaka była Twoja najlepsza podróż?', k: '가장 좋았던 여행은 뭐였어요?' },
          { pl: 'Czy podczas podróży wydarzyło Ci się coś zabawnego?', k: '여행 중에 재미있는 일이 있었어요?' },
          { pl: 'Wolisz morze, góry czy duże miasta?', k: '바다, 산, 큰 도시 중에서 어디를 더 좋아해요?' },
          { pl: 'W jakim kraju chciał(a)byś mieszkać w przyszłości?', k: '미래에 어느 나라에서 살고 싶어요?' },
          { pl: 'Wolisz mieszkać w dużym mieście czy na wsi?', k: '대도시에서 사는 것을 좋아해요, 아니면 시골에서 사는 것을 좋아해요?' },
          { pl: 'Czy chciał(a)byś kiedyś zamieszkać za granicą?', k: '언젠가 외국에서 살아 보고 싶어요?' },
          { pl: 'Jak wyglądałoby Twoje idealne życie?', k: '이상적인 삶은 어떤 모습이에요?' },
          { pl: 'Jaka jest jedna rzecz, którą koniecznie chcesz zrobić w życiu?', k: '살면서 꼭 해 보고 싶은 일 한 가지는 뭐예요?' },
          { pl: 'Gdybyś mógł/mogła przeprowadzić się jutro w dowolne miejsce na świecie, gdzie byś zamieszkał(a)?', k: '내일 당장 세계 어디로든 이사할 수 있다면 어디에서 살고 싶어요?' },
          { pl: 'Wolisz stabilne życie czy pełne przygód?', k: '안정적인 삶과 모험이 가득한 삶 중에서 어떤 삶을 더 좋아해요?' },
          { pl: 'Jakie miejsce na świecie najbardziej Cię fascynuje?', k: '세계에서 가장 매력적으로 느껴지는 곳은 어디예요?' },
          { pl: 'Co chciał(a)byś robić, gdybyś nie musiał(a) pracować?', k: '일하지 않아도 된다면 무엇을 하고 싶어요?' },
          { pl: 'Jakie marzenie chciał(a)byś spełnić w ciągu najbliższych pięciu lat?', k: '앞으로 5년 안에 이루고 싶은 꿈은 뭐예요?' },
          { pl: 'Co najbardziej lubisz w kraju, w którym mieszkasz?', k: '지금 살고 있는 나라에서 가장 좋아하는 것은 뭐예요?' },
          { pl: 'Co najbardziej zaskoczyło Cię w obcej kulturze?', k: '다른 나라의 문화를 접하면서 가장 놀랐던 점은 뭐예요?' },
          { pl: 'Czy chciał(a)byś spróbować życia w zupełnie innej kulturze?', k: '완전히 다른 문화 속에서 살아 보고 싶어요?' },
          { pl: 'Jakie polskie danie polecił(a)byś osobie z Korei?', k: '한국 사람에게 어떤 폴란드 음식을 추천하고 싶어요?' },
          { pl: 'Jakie koreańskie danie polecił(a)byś osobie z Polski?', k: '폴란드 사람에게 어떤 한국 음식을 추천하고 싶어요?' },
          { pl: 'Jakie miejsce w Twoim rodzinnym mieście warto odwiedzić?', k: '고향에서 꼭 가 봐야 하는 곳은 어디예요?' },
          { pl: 'Jakie zwyczaje w Twoim kraju mogą być zaskakujące dla obcokrajowców?', k: '외국인들에게 신기하게 느껴질 수 있는 당신 나라의 풍습은 뭐예요?' },
          { pl: 'Czy łatwo jest Ci nawiązywać znajomości z ludźmi z innych krajów?', k: '다른 나라 사람들과 쉽게 친해지는 편이에요?' },
          { pl: 'Co najbardziej chciał(a)byś poznać w koreańskiej kulturze?', k: '한국 문화에서 가장 알고 싶은 것은 뭐예요?' },
          { pl: 'Jak myślisz, czego można nauczyć się, mieszkając za granicą?', k: '외국에서 살면서 무엇을 배울 수 있다고 생각해요?' },
          { pl: 'Gdybyś mógł/mogła mieszkać przez rok w dowolnym kraju, ale nie mógł/mogła wrócić do domu, jaki kraj byś wybrał(a)?', k: '어느 나라에서든 1년 동안 살 수 있지만 집으로 돌아올 수 없다면 어느 나라를 선택하겠어요?' },
          { pl: 'Co jest ważniejsze przy wyborze miejsca do życia: ludzie, praca czy kultura?', k: '살 곳을 선택할 때 사람, 직장, 문화 중에서 무엇이 가장 중요하다고 생각해요?' },
          { pl: 'Czy uważasz, że podróże zmieniają osobowość człowieka?', k: '여행이 사람의 성격을 바꾼다고 생각해요?' },
          { pl: 'Gdybyś mógł/mogła nauczyć się jednej rzeczy od każdej kultury, co chciał(a)byś przejąć od kultury koreańskiej?', k: '각 문화에서 한 가지씩 배울 수 있다면 한국 문화에서 무엇을 배우고 싶어요?' },
          { pl: 'Czy łatwiej jest poczuć się jak w domu w nowym kraju, jeśli zna się jego język?', k: '그 나라의 언어를 알면 새로운 나라에서도 더 쉽게 편안함을 느낄 수 있다고 생각해요?' },
          { pl: 'Co byłoby dla Ciebie najtrudniejsze podczas przeprowadzki do innego kraju?', k: '다른 나라로 이사한다면 무엇이 가장 어려울 것 같아요?' },
          { pl: 'Gdybyś mógł/mogła przez miesiąc zamienić się życiem z osobą z innego kraju, kogo byś wybrał(a)?', k: '한 달 동안 다른 나라 사람과 삶을 바꿀 수 있다면 누구를 선택하고 싶어요?' },
          { pl: 'Czy miejsce, w którym dorastamy, ma duży wpływ na to, kim się stajemy?', k: '우리가 자란 곳이 우리가 어떤 사람이 되는지에 큰 영향을 미친다고 생각해요?' },
          { pl: 'Gdybyś miał(a) polecić komuś jedno doświadczenie, które warto przeżyć za granicą, co by to było?', k: '외국에서 꼭 해 봐야 할 경험 하나를 추천한다면 무엇을 추천하고 싶어요?' },
          { pl: 'Gdybyś mógł/mogła wybrać dowolne miejsce na świecie jako swój dom na zawsze, gdzie by to było i dlaczego?', k: '세계 어디든 평생 살 곳으로 선택할 수 있다면 어디를 선택하고 싶어요? 왜요?' }
        ]
      },
      {
        id: 'drama', badge: 'PL·KR', lang: 'MIX', topic: 'culture', premium: false,
        levels: ALL_LEVELS, level: { pl: 'wszystkie poziomy', ko: '모든 레벨' }, ages: ALL_AGES,
        name: { pl: 'K-drama i K-pop', ko: '드라마 · 케이팝' },
        desc: { pl: 'tłumaczenia w czacie', ko: '채팅 번역 지원' },
        rule: { pl: 'Piszcie w dowolnym języku, tłumaczenie pojawia się pod wiadomością.', ko: '어느 언어로든 써 보세요. 번역이 메시지 아래에 표시돼요.' }
      },
      {
        id: 'korea-life', badge: 'PL·KR', lang: 'MIX', topic: 'life', premium: false,
        levels: ['B1', 'B2', 'C1'], level: { pl: 'B1–B2', ko: 'B1–B2' }, ages: ['26-35', '36+'],
        name: { pl: 'Praca i życie w Korei', ko: '한국 생활' },
        desc: { pl: 'pytania do osób z Korei', ko: '한국에 사는 분들께 질문' },
        rule: { pl: 'Pytaj o pracę, wizy, mieszkanie i codzienność. Odpowiadamy po polsku i po koreańsku.', ko: '일, 비자, 집, 일상에 대해 물어보세요. 폴란드어와 한국어로 답해요.' }
      },
      {
        id: 'poland-life', badge: 'PL·KR', lang: 'MIX', topic: 'life', premium: false,
        levels: ['B1', 'B2', 'C1'], level: { pl: 'B1–B2', ko: 'B1–B2' }, ages: ['26-35', '36+'],
        name: { pl: 'Praca i życie w Polsce', ko: '폴란드 생활' },
        desc: { pl: 'pytania do osób z Polski', ko: '폴란드에 사는 분들께 질문' },
        rule: { pl: 'Pytaj o pracę, wizy, mieszkanie i codzienność w Polsce. Odpowiadamy po polsku i po koreańsku.', ko: '폴란드에서의 일, 비자, 집, 일상에 대해 물어보세요. 폴란드어와 한국어로 답해요.' }
      },
      {
        id: 'dance', badge: 'PL·KR', lang: 'MIX', topic: 'dance', premium: true,
        levels: ALL_LEVELS, level: { pl: 'wszystkie poziomy', ko: '모든 레벨' }, ages: ALL_AGES,
        name: { pl: 'Taniec i muzyka', ko: '춤과 음악' },
        desc: { pl: 'dla stałych bywalców', ko: '단골 전용' },
        rule: { pl: 'Dzielimy się choreografiami, piosenkami i wskazówkami.', ko: '안무, 노래, 팁을 함께 나눠요.' }
      }
    ],

    rooms: [
      {
        id: 'stolik-kr', always: true, premium: false, seats: 6, badge: 'KR',
        lang: 'KR', topic: 'language', levels: ['A1', 'A2', 'B1'], level: { pl: 'A1–B1', ko: 'A1–B1' }, ages: ALL_AGES,
        name: { pl: 'Stolik koreański · temat dnia', ko: '한국어 테이블 · 오늘의 주제' },
        // 14 tematów po koreańsku (q), z tłumaczeniem PL (tr). Temat zmienia się o północy czasu warszawskiego.
        daily: [
          { title: { pl: 'Poranna kawa', ko: '아침 커피' }, q: '오늘 아침에 뭐 마셨어요?', tr: 'Co dziś rano piłeś lub piłaś?', starter: '저는 오늘 아침에 ___ 마셨어요.' },
          { title: { pl: 'Plany na weekend', ko: '주말 계획' }, q: '이번 주말에 뭐 할 거예요?', tr: 'Co robisz w ten weekend?', starter: '저는 이번 주말에 ___ 할 거예요.' },
          { title: { pl: 'Ulubione jedzenie', ko: '좋아하는 음식' }, q: '제일 좋아하는 한국 음식이 뭐예요?', tr: 'Jakie jest Twoje ulubione koreańskie jedzenie?', starter: '제가 제일 좋아하는 음식은 ___ 이에요/예요.' },
          { title: { pl: 'Seriale', ko: '드라마' }, q: '요즘 어떤 드라마를 보고 있어요?', tr: 'Jaki serial teraz oglądasz?', starter: '요즘 ___ 보고 있어요.' },
          { title: { pl: 'Muzyka', ko: '음악' }, q: '요즘 어떤 노래를 자주 들어요?', tr: 'Jakiej piosenki ostatnio często słuchasz?', starter: '요즘 ___ 노래를 자주 들어요.' },
          { title: { pl: 'Hobby', ko: '취미' }, q: '취미가 뭐예요?', tr: 'Jakie masz hobby?', starter: '제 취미는 ___ 이에요/예요.' },
          { title: { pl: 'Podróże', ko: '여행' }, q: '한국에서 가 보고 싶은 곳이 어디예요?', tr: 'Dokąd w Korei chciał(a)byś pojechać?', starter: '저는 ___ 에 가 보고 싶어요.' },
          { title: { pl: 'Pogoda', ko: '날씨' }, q: '오늘 날씨 어때요?', tr: 'Jaka dziś jest pogoda?', starter: '오늘은 날씨가 ___ (좋아요, 추워요, 더워요).' },
          { title: { pl: 'Nauka koreańskiego', ko: '한국어 공부' }, q: '하루에 한국어를 얼마나 공부해요?', tr: 'Ile dziennie uczysz się koreańskiego?', starter: '저는 하루에 ___ 분 공부해요.' },
          { title: { pl: 'Zwierzęta', ko: '동물' }, q: '좋아하는 동물이 있어요?', tr: 'Masz ulubione zwierzę?', starter: '저는 ___ 좋아해요.' },
          { title: { pl: 'Ranek czy wieczór', ko: '아침 또는 저녁' }, q: '아침형 인간이에요, 저녁형 인간이에요?', tr: 'Jesteś rannym ptaszkiem czy nocnym markiem?', starter: '저는 ___ 인간이에요 (아침형/저녁형).' },
          { title: { pl: 'Kawa czy herbata', ko: '커피 또는 차' }, q: '커피를 좋아해요, 차를 좋아해요?', tr: 'Wolisz kawę czy herbatę?', starter: '저는 ___ 더 좋아해요.' },
          { title: { pl: 'Wczorajszy dzień', ko: '어제' }, q: '어제 뭐 했어요?', tr: 'Co robiłeś lub robiłaś wczoraj?', starter: '어제는 ___ 했어요.' },
          { title: { pl: 'Cele na ten rok', ko: '올해의 목표' }, q: '올해 꼭 하고 싶은 일이 뭐예요?', tr: 'Co koniecznie chcesz zrobić w tym roku?', starter: '올해는 꼭 ___ 고 싶어요.' }
        ]
      },
      {
        id: 'stolik-pl', always: true, premium: false, seats: 6, badge: 'PL',
        lang: 'PL', topic: 'language', levels: ['A1', 'A2', 'B1'], level: { pl: 'A1–B1', ko: 'A1–B1' }, ages: ALL_AGES,
        name: { pl: 'Stolik polski · temat dnia', ko: '폴란드어 테이블 · 오늘의 주제' },
        // 14 tematów po polsku (q), z tłumaczeniem KO (tr).
        daily: [
          { title: { pl: 'Poranna kawa', ko: '아침 커피' }, q: 'Co dziś rano piłeś lub piłaś?', tr: '오늘 아침에 뭐 마셨어요?', starter: 'Dziś rano piłem lub piłam ___.' },
          { title: { pl: 'Plany na weekend', ko: '주말 계획' }, q: 'Co robisz w ten weekend?', tr: '이번 주말에 뭐 해요?', starter: 'W ten weekend ___.' },
          { title: { pl: 'Ulubione jedzenie', ko: '좋아하는 음식' }, q: 'Jakie jest Twoje ulubione danie?', tr: '제일 좋아하는 음식이 뭐예요?', starter: 'Moje ulubione danie to ___.' },
          { title: { pl: 'Seriale', ko: '드라마' }, q: 'Jaki serial teraz oglądasz?', tr: '요즘 어떤 드라마를 보고 있어요?', starter: 'Teraz oglądam ___.' },
          { title: { pl: 'Muzyka', ko: '음악' }, q: 'Czego ostatnio najczęściej słuchasz?', tr: '요즘 무엇을 가장 자주 들어요?', starter: 'Ostatnio często słucham ___.' },
          { title: { pl: 'Hobby', ko: '취미' }, q: 'Jakie masz hobby?', tr: '취미가 뭐예요?', starter: 'Moje hobby to ___.' },
          { title: { pl: 'Podróże', ko: '여행' }, q: 'Dokąd w Polsce chciał(a)byś pojechać?', tr: '폴란드에서 가 보고 싶은 곳이 어디예요?', starter: 'Chcę pojechać do ___.' },
          { title: { pl: 'Pogoda', ko: '날씨' }, q: 'Jaka dziś jest pogoda?', tr: '오늘 날씨 어때요?', starter: 'Dziś jest ___.' },
          { title: { pl: 'Nauka polskiego', ko: '폴란드어 공부' }, q: 'Ile czasu dziennie uczysz się polskiego?', tr: '하루에 폴란드어를 얼마나 공부해요?', starter: 'Uczę się polskiego ___ minut dziennie.' },
          { title: { pl: 'Zwierzęta', ko: '동물' }, q: 'Czy masz ulubione zwierzę?', tr: '좋아하는 동물이 있어요?', starter: 'Lubię ___.' },
          { title: { pl: 'Ranek czy wieczór', ko: '아침 또는 저녁' }, q: 'Wolisz poranki czy wieczory?', tr: '아침이 좋아요, 저녁이 좋아요?', starter: 'Wolę ___.' },
          { title: { pl: 'Kawa czy herbata', ko: '커피 또는 차' }, q: 'Wolisz kawę czy herbatę?', tr: '커피가 좋아요, 차가 좋아요?', starter: 'Wolę ___.' },
          { title: { pl: 'Wczorajszy dzień', ko: '어제' }, q: 'Co robiłeś lub robiłaś wczoraj?', tr: '어제 뭐 했어요?', starter: 'Wczoraj ___.' },
          { title: { pl: 'Cele na ten rok', ko: '올해의 목표' }, q: 'Co koniecznie chcesz zrobić w tym roku?', tr: '올해 꼭 하고 싶은 일이 뭐예요?', starter: 'W tym roku chcę ___.' }
        ]
      },
      {
        id: 'stolik-3', always: true, premium: false, seats: 6, badge: 'ROOM',
        lang: 'MIX', topic: 'language', levels: ['A2', 'B1'], level: { pl: 'A2', ko: 'A2' }, ages: ALL_AGES,
        name: { pl: 'Stolik 3 · Jedzenie i kawa', ko: '3번 테이블 · 음식과 커피' },
        topicCard: {
          title: { pl: 'Zamawiamy w kawiarni', ko: '카페에서 주문하기' },
          ko: '아이스 아메리카노 한 잔 주세요.',
          pl: 'Poproszę jedno mrożone americano.'
        }
      },
      {
        id: 'jedzenie', time: '13:30', dow: EVERY_DAY, dur: 60, premium: false, seats: 8, badge: 'ROOM',
        lang: 'MIX', topic: 'language', levels: ['A2', 'B1'], level: { pl: 'A2–B1', ko: 'A2–B1' }, ages: ALL_AGES,
        name: { pl: 'Rozmowy o jedzeniu', ko: '음식 이야기' }
      },
      {
        id: 'start', time: '12:00', dow: EVERY_DAY, dur: 60, premium: false, seats: 8, badge: 'ROOM',
        lang: 'MIX', topic: 'language', levels: ['A1'], level: { pl: 'A1', ko: 'A1' }, ages: ALL_AGES,
        name: { pl: 'Początkujący: pierwsze zdania', ko: '초급: 첫 문장' }
      },
      {
        id: 'kpop-taniec', time: '12:00', dow: [6], dur: 60, premium: true, seats: 8, badge: 'ROOM',
        lang: 'MIX', topic: 'dance', levels: ALL_LEVELS, level: { pl: 'wszystkie poziomy', ko: '모든 레벨' }, ages: ALL_AGES,
        name: { pl: 'K-pop i taniec', ko: '케이팝과 춤' }
      }
    ],

    events: [
      {
        id: 'hangul', time: '13:00', dow: [4], dur: 90, premium: false,
        name: { pl: 'Wieczór hangul: piszemy po koreańsku', ko: '한글 쓰기 워크숍' },
        format: { pl: 'warsztat, 90 min', ko: '워크숍, 90분' }
      },
      {
        id: 'taniec', time: '12:00', dow: [6], dur: 60, premium: true,
        name: { pl: 'Taniec tradycyjny: pierwsze kroki', ko: '전통 무용: 첫걸음' },
        format: { pl: 'na żywo, 60 min', ko: '라이브, 60분' }
      },
      {
        id: 'drama-club', time: '12:00', dow: [0], dur: 90, premium: true,
        name: { pl: 'K-drama club: rozmowa po odcinku', ko: '드라마 클럽: 에피소드 수다' },
        format: { pl: 'room tematyczny, 90 min', ko: '주제별 대화방, 90분' }
      }
    ],

    /* Przykładowe wiadomości pokazywane tylko, gdy CFG.demo = true.
       lang = język oryginału, tr = tłumaczenie na drugi język. */
    seeds: {
      'chat:kr-a1': [
        { author: 'Hyunwoo', city: '서울', time: '20:41', lang: 'ko', text: '안녕하세요! 어디에 사세요?', tr: { pl: 'Cześć! Gdzie mieszkasz?' } },
        { author: 'Basia', city: 'Kraków', time: '13:42', lang: 'ko', text: '크라쿠프에 살아요.', tr: { pl: 'Mieszkam w Krakowie.' } },
        { author: 'Tomek', city: 'Warszawa', time: '13:44', lang: 'ko', text: '나는 커피 좋아해요.', tr: { pl: 'Lubię kawę.' } },
        { author: 'Hyunwoo', city: '서울', time: '20:45', lang: 'ko', text: '저는 커피를 좋아해요.', fix: { pl: 'Grzeczniej: 저는 zamiast 나는. Dopełnienie dostaje partykułę -를.', ko: '더 공손하게: 나는 대신 저는. 목적어에는 조사 -를/을 붙여요.' } },
        { author: 'Hyunwoo', city: '서울', time: '20:46', lang: 'ko', text: '모두 잘했어요!', tr: { pl: 'Wszyscy świetnie wam poszło!' } }
      ],
      'chat:pl-b1': [
        { author: 'Minji', city: '서울', time: '20:30', lang: 'pl', text: 'Dzień dobry! Uczę się polskiego.', tr: { ko: '안녕하세요! 저는 폴란드어를 배우고 있어요.' } },
        { author: 'Ola', city: 'Kraków', time: '13:31', lang: 'pl', text: 'Dzień dobry, Minji! Świetnie ci idzie.', tr: { ko: '안녕하세요, 민지 씨! 정말 잘하고 계세요.' } },
        { author: 'Minji', city: '서울', time: '20:33', lang: 'pl', text: 'Lubię kawa.', tr: { ko: '저는 커피를 좋아해요.' } },
        { author: 'Ola', city: 'Kraków', time: '13:34', lang: 'pl', text: 'Lubię kawę.', fix: { pl: 'Biernik: kawa → kawę.', ko: '대격: kawa → kawę.' } }
      ],
      'room:stolik-3': [
        { author: 'Minjun', city: '서울', time: '20:10', lang: 'ko', text: '주문하시겠어요?', tr: { pl: 'Czy chcesz złożyć zamówienie?' } },
        { author: 'Kasia', city: 'Kraków', time: '13:11', lang: 'ko', text: '라떼 한 잔 주세요.', tr: { pl: 'Poproszę jedną latte.' } }
      ]
    }
  };

  /* Ćwiczenia rozmów: krótkie scenariusze, w których odpowiadasz po koreańsku.
     ex[]: u = rozmówca, k = wiadomość po koreańsku, p = tłumaczenie PL,
           o = trzy odpowiedzi do wyboru, a = indeks poprawnej odpowiedzi (0-2).
     Zdania warto przejrzeć z native speakerem przed publikacją. */
  window.KCO_DATA.practice = [
    { id: 'comeback', badge: 'A1', level: 'A1',
      name: { pl: 'Dzień comebacku', ko: '컴백 데이' },
      desc: { pl: 'po występie i premierze', ko: '무대와 신곡 이야기' },
      ex: [
        { u: 'mint_latte', k: '오늘 컴백 무대 봤어요?', p: 'Widziałaś dzisiejszy występ comebackowy?', o: ['네, 정말 멋있었어요!', '아니요, 저는 커피예요.', '얼마예요?'], a: 0 },
        { u: 'seoul_bean', k: '저는 두 번 봤어요. 노래가 너무 좋아요.', p: 'Ja oglądałam dwa razy. Piosenka jest super.', o: ['저도 노래가 좋아요.', '저는 학생이 아니에요.', '물 주세요.'], a: 0 },
        { u: 'dalgona.k', k: '다음 주에 팬 미팅도 있어요.', p: 'W przyszłym tygodniu jest też fanmeeting.', o: ['커피가 없어요.', '와, 같이 가요!', '안녕히 가세요.'], a: 1 }
      ] },
    { id: 'lyrics', badge: 'A2', level: 'A2',
      name: { pl: 'Klub tekstów', ko: '가사 클럽' },
      desc: { pl: 'teksty piosenek i słówka', ko: '노래 가사와 단어' },
      ex: [
        { u: 'hanbok_fan', k: '이 가사 무슨 뜻이에요?', p: 'Co znaczy ten tekst?', o: ['사랑이라는 뜻이에요.', '내일 만나요.', '커피가 없어요.'], a: 0 },
        { u: 'nuna_cafe', k: '한국어 공부 얼마나 했어요?', p: 'Jak długo uczysz się koreańskiego?', o: ['아메리카노 주세요.', '삼 년 했어요.', '저는 고양이예요.'], a: 1 }
      ] },
    { id: 'drama', badge: 'A2', level: 'A2',
      name: { pl: 'Wieczór z dramą', ko: '드라마 나이트' },
      desc: { pl: 'rozmowa o wczorajszym odcinku', ko: '어제 본 드라마 이야기' },
      ex: [
        { u: 'kimchi_cat', k: '어제 드라마 어땠어요?', p: 'Jak był wczorajszy dramat?', o: ['지금 열 시예요.', '화장실이 어디예요?', '너무 재미있었어요!'], a: 2 },
        { u: 'bori_tea', k: '저는 울었어요. 마지막 장면이 슬퍼요.', p: 'Płakałam. Ostatnia scena jest smutna.', o: ['저도 눈물이 났어요.', '맛있게 드세요.', '천천히 가세요.'], a: 0 }
      ] },
    { id: 'order', badge: 'A1', level: 'A1',
      name: { pl: 'Przy ladzie', ko: '카페 주문' },
      desc: { pl: 'zamawianie kawy po koreańsku', ko: '한국어로 커피 주문하기' },
      ex: [
        { u: 'jisoo_barista', k: '어서 오세요! 뭐 드릴까요?', p: 'Witamy! Co podać?', o: ['안녕히 가세요.', '저는 학생이에요.', '아이스 아메리카노 한 잔 주세요.'], a: 2 },
        { u: 'jisoo_barista', k: '사이즈는요?', p: 'Jaki rozmiar?', o: ['한국에서 왔어요.', '큰 걸로 주세요.', '내일 봐요.'], a: 1 }
      ] }
  ];

  /* Rozmowa z baristą (Ćwicz): zamawiamy americano. Pytania zadawane po kolei;
     jeśli ktoś odpowie od razu na kilka (np. "큰 아이스 아메리카노"), pasujące pytania są pomijane.
     keys = słowa po których rozpoznajemy odpowiedź (regex), yn = akceptuje też "tak/nie",
     kind: 0 zwykły krok, 1 = imię (przyjmuje dowolny tekst), 2 = zakończenie. */
  window.KCO_DATA.barista = {
    id: 'barista', badge: 'A1',
    name: { pl: 'Zamówimy americano', ko: '아메리카노 주문하기' },
    desc: { pl: 'rozmowa z baristą', ko: '바리스타와 대화' },
    barista: '지수 바리스타',
    steps: [
      { q: '어서 오세요! 뭐 드릴까요?', tr: 'Witamy! Co podać?', sample: '아메리카노 한 잔 주세요.', sampleTr: 'Poproszę jedno americano.', keys: '아메리카노|라테|녹차|커피', yn: false, kind: 0 },
      { q: '따뜻한 걸로 드릴까요, 차가운 걸로 드릴까요?', tr: 'Gorące czy zimne?', sample: '아이스로 주세요.', sampleTr: 'Poproszę zimne (z lodem).', keys: '따뜻|뜨거|핫|차가|아이스|시원', yn: false, kind: 0 },
      { q: '사이즈는 어떻게 해 드릴까요?', tr: 'Jaki rozmiar?', sample: '큰 걸로 주세요.', sampleTr: 'Poproszę duży.', keys: '작은|보통|큰|톨|그란데|벤티|레귤러|스몰|라지|사이즈', yn: false, kind: 0 },
      { q: '샷 추가하실래요?', tr: 'Dodać shot espresso?', sample: '아니요, 괜찮아요.', sampleTr: 'Nie, dziękuję.', keys: '샷', yn: true, kind: 0 },
      { q: '시럽은 필요하세요?', tr: 'Czy potrzebny syrop?', sample: '시럽은 괜찮아요.', sampleTr: 'Syrop nie jest potrzebny.', keys: '시럽', yn: true, kind: 0 },
      { q: '여기서 드실 거예요, 가져가실 거예요?', tr: 'Na miejscu czy na wynos?', sample: '여기서 먹을 거예요.', sampleTr: 'Zjem na miejscu.', keys: '여기|가져|포장|테이크아웃|매장|먹고', yn: false, kind: 0 },
      { q: '디저트도 같이 드릴까요?', tr: 'Podać też coś słodkiego?', sample: '크루아상 하나 주세요.', sampleTr: 'Poproszę jednego croissanta.', keys: '크루아상|케이크|쿠키|빵|디저트|마들렌|스콘', yn: true, kind: 0 },
      { q: '카드로 하실 거예요, 현금으로 하실 거예요?', tr: 'Płacisz kartą czy gotówką?', sample: '카드로 할게요.', sampleTr: 'Zapłacę kartą.', keys: '카드|현금|페이|계산', yn: false, kind: 0 },
      { q: '성함이 어떻게 되세요?', tr: 'Jak masz na imię? (na kubek)', sample: '민지예요.', sampleTr: 'Mam na imię Minji.', keys: '', yn: false, kind: 1 },
      { q: '주문하신 음료 나왔습니다! 맛있게 드세요.', tr: 'Twój napój gotowy! Smacznego.', sample: '감사합니다!', sampleTr: 'Dziękuję!', keys: '', yn: false, kind: 2 }
    ]
  };
})();
