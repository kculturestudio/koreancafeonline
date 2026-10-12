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
        rule: { pl: 'Pisz po koreańsku, native speakerzy poprawiają.', ko: '한국어로 써 보세요. 원어민이 고쳐 드려요.' }
      },
      {
        id: 'pl-b1', badge: 'PL', lang: 'PL', topic: 'language', premium: false,
        levels: ['B1', 'B2'], level: { pl: 'B1', ko: 'B1' }, ages: ALL_AGES,
        name: { pl: 'Rozmowy po polsku', ko: '폴란드어 대화' },
        desc: { pl: 'dla Koreańczyków', ko: '한국분들을 위한 방' },
        rule: { pl: 'Pisz po polsku, native speakerzy poprawiają.', ko: '폴란드어로 써 보세요. 원어민이 고쳐 드려요.' }
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
})();
