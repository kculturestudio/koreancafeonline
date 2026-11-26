/* Teksty Kotka-przewodnika (PL / KO / EN). EN jest kluczowany polskim tekstem, tak jak reszta aplikacji. */
(function () {
  'use strict';
  var S = window.KCO_I18N, EN = window.KCO_EN || (window.KCO_EN = {});
  function add(k, pl, ko, en) { S[k] = [pl, ko]; if (!Object.prototype.hasOwnProperty.call(EN, pl)) EN[pl] = en; }
  add('mg.label.welcome', 'Witaj!', '환영해요!', 'Welcome!');
  add('mg.label.explanation', 'Wyjaśnienie', '설명', 'Explanation');
  add('mg.label.hint', 'Podpowiedź', '힌트', 'Hint');
  add('mg.label.success', 'Brawo!', '잘했어요!', 'Well done!');
  add('mg.label.correction', 'Prawie!', '아쉬워요!', 'Almost!');
  add('mg.label.encouragement', 'Dasz radę!', '힘내요!', 'You can do it!');
  add('mg.label.announcement', 'Z kawiarni', '카페 소식', 'Café news');
  add('mg.close', 'Zamknij podpowiedź', '닫기', 'Dismiss tip');
  add('mg.open', 'Pomoc od Kotka', '고양이 도우미', 'Help from the cat');
  add('mg.next', 'Dalej', '다음', 'Next');
  add('mg.done', 'Gotowe', '완료', 'Got it');
  add('mg.welcome', 'Cześć! Jestem Kotek, Twój przewodnik po kawiarni. Pomogę Ci krok po kroku uczyć się koreańskiego.',
    '안녕하세요! 저는 카페 안내 고양이예요. 한국어 공부를 한 걸음씩 도와 드릴게요.',
    'Hi! I am Kotek, your guide around the café. I will help you learn Korean step by step.');
  add('mg.welcomeN', 'Cześć, {n}! Jestem Kotek, Twój przewodnik po kawiarni. Pomogę Ci krok po kroku uczyć się koreańskiego.',
    '{n} 님, 안녕하세요! 저는 카페 안내 고양이예요. 한국어 공부를 한 걸음씩 도와 드릴게요.',
    'Hi, {n}! I am Kotek, your guide around the café. I will help you learn Korean step by step.');
  add('mg.tourYes', 'Pokaż mi', '보여 주세요', 'Show me around');
  add('mg.tourNo', 'Później', '나중에', 'Maybe later');
  add('mg.tour1', 'Na dole masz menu: kawiarnia, stoliki, wydarzenia i ćwiczenia.',
    '아래 메뉴에 카페, 테이블, 이벤트, 연습이 있어요.', 'The menu at the bottom has the café, tables, events and practice.');
  add('mg.tour2', 'W Ćwiczeniach czeka lekcja dnia ze mną. Wystarczy kilka minut.',
    '연습 탭에서 저와 함께하는 오늘의 수업을 만날 수 있어요. 몇 분이면 충분해요.',
    'Practice has the lesson of the day with me. A few minutes is enough.');
  add('mg.tour3', 'Gdy utkniesz, dotknij mnie, a podpowiem. Mam być zawsze pod ręką?',
    '막히면 저를 눌러 주세요. 힌트를 드릴게요. 항상 옆에 있을까요?',
    'If you get stuck, tap me and I will give you a hint. Should I always stay nearby?');
  add('mg.dockYes', 'Tak, zostań', '네, 옆에 있어 주세요', 'Yes, stay');
  add('mg.dockNo', 'Nie, dzięki', '아니요, 괜찮아요', 'No, thanks');
  add('mg.practiceHub', 'Tu ćwiczysz rozmowy i lekcje. Zacznij od lekcji dnia, to najlepszy pierwszy krok.',
    '여기서 대화와 수업을 연습해요. 오늘의 수업부터 시작해 보세요.',
    'Here you practise conversations and lessons. Start with the lesson of the day, it is the best first step.');
  add('mg.path', 'To ścieżka lekcji. Ukończ lekcję, aby zdobyć gwiazdki, a potem przejdź do następnej.',
    '수업 길이에요. 수업을 마치면 별을 받고, 다음 수업으로 넘어가요.',
    'This is the lesson path. Finish a lesson to earn stars, then move on to the next one.');
  add('mg.lessonStart', 'Zaczynamy lekcję „{t}”! Najpierw krótka historia, potem słówka, zasada i ćwiczenia.',
    '“{t}” 수업을 시작해요! 먼저 짧은 이야기, 그다음 단어, 문법, 연습이에요.',
    'Let us start the lesson “{t}”! First a short story, then words, the rule and exercises.');
  add('mg.words', 'Dotknij ikony głośnika, żeby usłyszeć wymowę, i powtórz na głos. To świetny sposób, by zapamiętać słowo.',
    '스피커 아이콘을 눌러 발음을 듣고 소리 내어 따라 해 보세요. 단어를 외우는 좋은 방법이에요.',
    'Tap the speaker icon to hear the pronunciation and repeat it out loud. It is a great way to remember a word.');
  add('mg.grammar', 'Spójrz na kolorowe części wzoru. Każda ma swoją rolę w zdaniu, a kolejność ma znaczenie.',
    '공식의 색깔 부분을 보세요. 각 부분은 문장에서 역할이 있고 순서도 중요해요.',
    'Look at the coloured parts of the formula. Each has its own role in the sentence, and the order matters.');
  add('mg.q.choice', 'Przeczytaj uważnie wszystkie odpowiedzi. Najpierw odrzuć w myślach te, które na pewno nie pasują.',
    '선택지를 모두 천천히 읽어 보세요. 확실히 아닌 것부터 지워 보세요.',
    'Read all the answers carefully. First rule out the ones that clearly do not fit.');
  add('mg.q.scene', 'Posłuchaj kwestii (ikona głośnika) i pomyśl, co powiedziałby klient w kawiarni. Dopasuj odpowiedź do sytuacji.',
    '대사를 듣고(스피커 아이콘) 카페 손님이라면 뭐라고 할지 생각해 보세요. 상황에 맞는 답을 고르세요.',
    'Listen to the line (speaker icon) and think what a customer in a café would say. Match the answer to the situation.');
  add('mg.q.build', 'Układaj klocki od początku zdania. W koreańskim czasownik stoi na końcu.',
    '문장의 처음부터 블록을 놓아 보세요. 한국어에서는 동사가 문장 맨 끝에 와요.',
    'Place the blocks from the start of the sentence. In Korean the verb comes at the end.');
  add('mg.combo', 'Seria ×{n}! Tak trzymaj!', '{n}연속 정답! 계속 이렇게 해요!', 'Streak ×{n}! Keep it up!');
  add('mg.oops1', 'Nic się nie stało, błędy to część nauki. Przeczytaj wyjaśnienie poniżej i spróbuj w następnym kroku.',
    '괜찮아요, 실수는 배우는 과정이에요. 아래 설명을 읽고 다음 문제에 도전해 보세요.',
    'No worries, mistakes are part of learning. Read the explanation below and try the next step.');
  add('mg.keepGoing', 'Nie poddawaj się! Każda próba przybliża Cię do celu.',
    '포기하지 마세요! 시도할 때마다 목표에 가까워져요.', 'Do not give up! Every attempt brings you closer to your goal.');
  add('mg.firstDone', 'Pierwsza lekcja za Tobą! Tak zaczyna się każda wielka droga.',
    '첫 수업 완료! 모든 큰 여정은 이렇게 시작돼요.', 'Your first lesson is done! Every long journey starts like this.');
  add('mg.perfect', 'Bez ani jednego błędu! Jesteś gwiazdą kawiarni.',
    '하나도 안 틀렸어요! 카페의 스타예요.', 'Not a single mistake! You are the star of the café.');
  add('mg.lessonDone', 'Świetna robota! Wróć jutro po kolejną lekcję, codzienna praktyka robi różnicę.',
    '정말 잘했어요! 내일 다음 수업으로 만나요. 매일 연습하는 게 큰 차이를 만들어요.',
    'Great job! Come back tomorrow for the next lesson, daily practice makes a difference.');
  add('mg.pOk', 'Dobrze!', '좋아요!', 'Nice!');
  add('mg.pDone', 'Cały dialog za Tobą. Super!', '대화를 모두 마쳤어요. 최고예요!', 'The whole dialogue is done. Super!');
  add('mg.pWrong', 'To nie ta odpowiedź, ale nic się nie stało. Przeczytaj pytanie jeszcze raz i spróbuj ponownie.',
    '이 답은 아니에요. 괜찮아요. 질문을 다시 읽고 한 번 더 해 보세요.',
    'That is not the right answer, but no problem. Read the question again and try once more.');
  add('mg.help.default', 'W czym mogę pomóc? Zacznij od lekcji dnia w zakładce Ćwiczenia.',
    '무엇을 도와 드릴까요? 연습 탭에서 오늘의 수업부터 해 보세요.',
    'How can I help? Start with the lesson of the day in the Practice tab.');
  add('mg.toPractice', 'Do ćwiczeń', '연습으로', 'Go to practice');
  add('mg.set.tips', 'Podpowiedzi Kotka', '고양이 힌트', 'Cat tips');
  add('mg.set.dock', 'Przycisk pomocy Kotka', '고양이 도우미 버튼', 'Cat help button');
})();
