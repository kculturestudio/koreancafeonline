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
})();
