/* ===== Struktura z analizy UX: Lada → Pogaduszki → Stolik próbny → Stolik sezonowy → Sala live =====
   Dane stolików są przykładowe (demo). Koreańskie teksty do sprawdzenia przez native speakera. */
(function () {
  var I = window.KCO_I18N, D = window.KCO_DATA;
  Object.assign(I, {
    /* nawigacja i nazwy stref */
    'nav.cafe': ['Pogaduszki', '수다방'],
    'nav.rooms': ['Stoliki', '테이블'],
    'nav.hall': ['Sala live', '라이브'],
    'lobby.title': ['Pogaduszki', '수다방'],
    'lobby.sub': ['otwarte kąciki bez presji; grupa na stałe czeka w Stolikach', '부담 없는 열린 코너예요. 고정 그룹은 테이블에서 만나요'],
    'profile.premiumDemo': ['Dostęp Premium: podgląd wszystkich produktów Premium', '프리미엄 접근: 모든 프리미엄 상품 미리보기'],
    'profile.premiumDemoOn': ['Podgląd Premium włączony', '프리미엄 미리보기가 켜졌어요'],
    'profile.premiumDemoOff': ['Podgląd Premium wyłączony', '프리미엄 미리보기가 꺼졌어요'],
    'profile.beta': ['Tryb testowy (beta): stoliki płatne do przetestowania', '테스트 모드(베타): 유료 테이블 체험'],
    'profile.betaOn': ['Tryb testowy włączony', '테스트 모드가 켜졌어요'],
    'profile.betaOff': ['Tryb testowy wyłączony', '테스트 모드가 꺼졌어요'],
    'profile.reset': ['Zresetuj demo (zacznij jako nowy klient)', '데모 초기화 (새 고객으로 시작)'],
    'profile.resetDone': ['Postęp wyzerowany. Zaczynasz od Lady.', '진행 상황을 초기화했어요. 접수대에서 시작해요.'],
    'rw.trialTitle': ['Nagroda za aktywność', '활동 보상'],
    'rw.trialBody': ['XP z próbnego tygodnia zamienia się w kupon na pierwszy sezon: 50 XP to −10%, 100 XP to −20%.', '체험 주간의 XP는 첫 시즌 쿠폰이 돼요: 50 XP는 −10%, 100 XP는 −20%.'],
    'rw.xp': ['{n} XP z 100', '100 XP 중 {n}'],
    'rw.coupon': ['Twój kupon na pierwszy sezon: −{n}%', '첫 시즌 쿠폰: −{n}%'],
    'rw.none': ['Zbieraj XP, żeby odblokować kupon.', 'XP를 모아 쿠폰을 열어 보세요.'],
    'rw.seasonTitle': ['Zniżka lojalnościowa', '로열티 할인'],
    'rw.seasonBody': ['Po 4 tygodniach z serią (3 dni aktywności z 7) dostajesz −10% przy odnowieniu. Cena stolika jest stała dla poziomu i tematu.', '4주 동안 주 3일 이상 활동하면 갱신 시 −10%예요. 테이블 가격은 레벨과 주제별로 고정이에요.'],
    'rw.week': ['Tydzień {n} z 4', '4주 중 {n}주차'],
    'tb.demoSeason': ['Demo: sezon aktywowany bez płatności. Masz też dostęp do stolików 24/7.', '데모: 결제 없이 시즌이 시작됐어요. 24시간 테이블도 이용할 수 있어요.'],
    'bn.title': ['W cenie sezonu', '시즌에 포함된 것'],
    'bn.1': ['4 tygodnie przy stałym stoliku z gospodarzem', '고정 테이블에서 진행자와 함께하는 4주'],
    'bn.2': ['Prompt dnia i XP z nagrodami', '오늘의 프롬프트와 XP 보상'],
    'bn.3': ['Rozmowa live raz w miesiącu (4. tydzień sezonu)', '한 달에 한 번 라이브 대화 (시즌 4주차)'],
    'bn.3e': ['Wydarzenia tematyczne zamiast rozmowy live', '라이브 대화 대신 주제별 이벤트'],
    'ev.funnelTitle': ['Wydarzenia dla tego stolika', '이 테이블을 위한 이벤트'],
    'ev.funnelBody': ['Zamiast rozmowy live są wydarzenia tematyczne, w których bierzesz udział z osobami z sezonem lub Premium.', '라이브 대화 대신 시즌 또는 프리미엄 회원과 함께하는 주제별 이벤트가 있어요.'],
    'ev.funnelCta': ['Zobacz wydarzenia', '이벤트 보기'],
    'bn.4': ['Stoliki 24/7 i wydarzenia premium', '24시간 테이블과 프리미엄 이벤트'],
    'bn.5': ['Zniżka −10% przy odnowieniu po 4 tygodniach z serią', '4주 활동 후 갱신 시 −10%'],
    'lv.monthly': ['Live odbywa się raz w miesiącu, w 4. tygodniu sezonu. Zapisy otwierają się w 3. tygodniu.', '라이브는 한 달에 한 번, 시즌 4주차에 열려요. 신청은 3주차부터예요.'],
    'ev.mine': ['Twój zapis', '내 신청'],
    'tb.sec.seasonLevel': ['Sezon · według poziomu', '시즌 · 레벨별'],
    'tb.sec.seasonTopic': ['Sezon · tematyczne', '시즌 · 주제별'],
    'tb.tag.club': ['Klub', '클럽'],
    'tb.tag.mentor': ['Z NAUCZYCIELEM · 29 zł/mies.', '선생님과 함께 · 월 29 zł'],
    'tb.clubFree': ['Za darmo', '무료'],
    'tb.clubPremium': ['Premium · 29 zł/mies.', '프리미엄 · 월 29 zł'],
    'tb.mentorInfo': ['Mała grupa 5 osób z nauczycielem, który prowadzi rozmowę na żywo i poprawia błędy. 29 zł miesięcznie, start 1 stycznia. Zapisz się na listę, a jako pierwsza(-y) dostaniesz zapisy w przedsprzedaży.', '선생님이 라이브로 대화를 이끌고 오류를 고쳐 주는 5인 소그룹이에요. 월 29 zł, 1월 1일 시작. 대기 명단에 등록하면 사전 판매를 가장 먼저 안내해 드려요.'],
    'tb.mentorCta': ['Zapisz się na listę · 7 dni za darmo', '대기 명단 등록 · 7일 무료'],
    'tb.paidInfo': ['Stolik płatny, start 1 stycznia. Zapisz się na listę, a jako pierwsza(-y) dostaniesz zapisy w przedsprzedaży.', '유료 테이블, 1월 1일 시작. 대기 명단에 등록하면 사전 판매를 가장 먼저 안내해 드려요.'],
    'tb.paidCta': ['Zapisz się na listę', '대기 명단 등록'],
    'tb.joinBeta': ['Dołącz do testów', '테스트 참여하기'],
    'beta.on': ['Dostęp beta: kluby Premium i stoliki płatne są dla Ciebie odblokowane na czas testów. Napisz nam, co nie działa.', '베타 접근: 테스트 기간 동안 프리미엄 클럽과 유료 테이블이 열려 있어요. 문제가 있으면 알려 주세요.'],
    'beta.toast': ['Dostęp beta włączony. Dziękujemy za testowanie!', '베타 접근이 켜졌어요. 테스트에 참여해 주셔서 고마워요!'],
    'tb.trial7': ['Pierwsze 7 dni za darmo, potem płatny sezon.', '첫 7일 무료, 이후 유료 시즌이에요.'],
    'lobby.mentorTitle': ['Stolik Beginner z nauczycielem', '선생님과 함께하는 초급 테이블'],
    'lobby.mentorCta': ['Zobacz stolik', '테이블 보기'],
    'lobby.mentorBody': ['Dla uczących się koreańskiego. 5 osób, nauczyciel na żywo. 7 dni za darmo, potem 29 zł/mies. Start 1 stycznia.', '한국어를 배우는 분을 위한 테이블. 5명, 라이브 선생님. 7일 무료, 이후 월 29 zł. 1월 1일 시작.'],
    'lobby.plTitle': ['Klub Polski dla Koreańczyków', '한국인을 위한 폴란드어 클럽'],
    'lobby.plBody': ['Rozmowy po polsku! Klub w ramach Premium: Koreańczycy piszą, Polacy poprawiają.', '폴란드어로 대화해요! 프리미엄 클럽이에요. 한국인은 쓰고, 폴란드인은 고쳐 줘요.'],
    'tb.clubOpen': ['Otwarty klub, bez zapisu', '신청 없이 열린 클럽'],
    'tb.clubMeta': ['Wkrótce', '곧 오픈'],
    'tb.clubLocked': ['Ten klub jest w Premium (29 zł/mies.). Podgląd poniżej.', '이 클럽은 프리미엄(월 29 zł)에 포함돼요. 아래는 미리보기예요.'],
    'tb.clubUnlock': ['Odblokuj z Premium', '프리미엄으로 열기'],
    'tb.forming': ['Zbieramy grupę: {n} z {m}', '그룹 모집 중: {n}/{m}'],
    'tb.formingBody': ['Ten sezon otwiera się, gdy zbierze się 4 osoby. Zapisz się na listę, a damy znać, kiedy ruszy.', '4명이 모이면 이 시즌이 열려요. 대기 명단에 등록하면 시작할 때 알려 드려요.'],
    'tb.waitlist': ['Zapisz się na listę', '대기 명단에 등록'],
    'tb.onList': ['Jesteś na liście', '명단에 등록됨'],
    'tb.waitlistToast': ['Zapisana(-y). Dostaniesz znać, gdy zbierze się grupa.', '등록됐어요. 그룹이 모이면 알려 드려요.'],
    'tb.sec.seasonPractical': ['Sezon · tematy praktyczne', '시즌 · 실용 주제'],
    'tb.sec.clubs': ['Kluby cykliczne', '정기 클럽'],
    'lobby.toTables': ['Chcesz stałej grupy?', '고정 그룹을 원하세요?'],
    'lobby.toTablesBody': ['Każdy stolik ma 7 dni za darmo, potem zostajesz z grupą w sezonie.', '모든 테이블은 7일 무료예요. 이후 같은 그룹과 시즌을 이어가요.'],
    'corner.tips': ['Study tips', '공부 꿀팁'],
    'pf.grpProfile': ['Profil', '프로필'],
    'pf.grpApp': ['Aplikacja', '앱'],
    'pf.grpAbout': ['O aplikacji', '앱 정보'],
    'pf.grpTest': ['Dla testujących', '테스트용'],
    'pf.resetAsk': ['Zresetować demo? Dane z tej przeglądarki zostaną usunięte.', '데모를 초기화할까요? 이 브라우저의 데이터가 삭제돼요.'],
    'pf.resetYes': ['Tak, zresetuj', '네, 초기화'],
    'pf.cancel': ['Anuluj', '취소'],
    'profile.info': ['Informacje', '안내'],
    'profile.about': ['O Korean Cafe Online', 'Korean Cafe Online 소개'],
    'profile.aboutSub': ['Koncepcja, subskrypcja, czaty i wydarzenia', '콘셉트, 구독, 채팅, 이벤트'],
    'lobby.contact': ['Skontaktuj się z nami', '문의하기'],
    'tb.plLessons': ['Wydarzenia: lekcje polskiego', '이벤트: 폴란드어 수업'],
    'tb.plLessonsSub': ['Lekcje na żywo z nauczycielem, dla Koreańczyków uczących się polskiego.', '폴란드어를 배우는 한국인을 위한 라이브 수업이에요.'],
    'lobby.whoLabel': ['Czego się uczysz', '무엇을 배우나요'],
    'lobby.whoKo': ['Uczę się koreańskiego', '한국어를 배워요'],
    'lobby.whoPl': ['Uczę się polskiego', '폴란드어를 배워요'],
    'corner.practice': ['Ćwicz gotowe scenariusze z kotkiem', '고양이와 준비된 시나리오 연습'],
    'corner.practiceT': ['Ćwicz z kotkiem', '고양이와 연습'],
    'corner.practiceS': ['Gotowe scenariusze rozmów, krok po kroku', '준비된 대화 시나리오를 단계별로'],
    'tb.oneTrial': ['Masz już Stolik próbny. Próbny jest jeden na osobę.', '이미 체험 테이블에 참여 중이에요. 체험은 1인 1개예요.'],
    'tb.stay': ['Po 7 dniach ta sama grupa przechodzi do sezonu', '7일 후 같은 그룹이 시즌으로 이어져요'],
    'tb.stayBody': ['Zostajesz z ludźmi, których już znasz. Próbny tydzień to pierwszy tydzień Twojego stolika.', '이미 아는 사람들과 계속해요. 체험 주간은 테이블의 첫 주예요.'],
    'tb.stayCta': ['Zostań z grupą', '이 그룹과 계속하기'],
    'lada.assigned': ['Przydzieliliśmy Ci stolik: {n}', '테이블이 배정됐어요: {n}'],
    'mt.title': ['Dopasowaliśmy Cię', '맞춤 배정 완료'],
    'mt.sub': ['Poziom {lv}: dołączyłeś(-aś) do stolika próbnego. Poniżej stoliki tematyczne pod Twoje zainteresowania.', '레벨 {lv}: 체험 테이블에 자동으로 참여했어요. 아래는 관심사에 맞는 주제 테이블이에요.'],
    'mt.yours': ['Twój stolik na start', '시작 테이블'],
    'mt.open': ['Idź do stolika', '테이블로 가기'],
    'mt.topics': ['Stoliki tematyczne dla Ciebie', '나를 위한 주제 테이블'],
    'mt.topicsSub': ['Dobrane po zainteresowaniach i poziomie. Zapisz się na listę, żeby dać znać, że chcesz dołączyć.', '관심사와 레벨에 맞춰 골랐어요. 대기 명단에 등록해 주세요.'],
    'gd.title': ['Jak działa nasza kawiarnia?', '우리 카페는 이렇게 운영돼요'],
    'gd.t1': ['Stoliki tematyczne', '주제 테이블'],
    'gd.t1b': ['Stała grupa 4–6 osób wokół tematu (np. K-pop, kuchnia). Sezon trwa 4 tygodnie, raz w miesiącu jest live.', '주제별 4~6명 고정 그룹. 시즌은 4주, 한 달에 한 번 라이브가 있어요.'],
    'gd.t2': ['Kluby', '클럽'],
    'gd.t2b': ['Wspólne zainteresowanie bez stałej grupy: książki, K-dramy, taniec, gotowanie. Zamiast live masz spotkania cykliczne.', '고정 그룹 없이 공통 관심사로 모여요: 책, K-드라마, 댄스, 요리. 라이브 대신 정기 모임이 있어요.'],
    'gd.t3': ['Live', '라이브'],
    'gd.t3b': ['25 minut rozmowy audio z ludźmi z Twojego stolika. Termin wybierasz przy stoliku, kamera jest opcjonalna.', '내 테이블 사람들과 25분 음성 대화. 시간은 테이블에서 고르고, 카메라는 선택이에요.'],
    'gd.t4': ['Wydarzenia', '이벤트'],
    'gd.t4b': ['Live, spotkania klubów i wydarzenia premium zebrane w jednym miejscu, w zakładce Wydarzenia.', '라이브, 클럽 모임, 프리미엄 이벤트를 이벤트 탭에서 한눈에 볼 수 있어요.'],
    'mt.today': ['Stolik dnia', '오늘의 테이블'],
    'mt.todaySub': ['Otwarty 24/7 i za darmo: wejdź, odpowiedz na pytanie dnia i wyjdź, kiedy chcesz.', '24시간 무료: 들어와서 오늘의 질문에 답하고 언제든 나가요.'],
    'tb.lvlLabel': ['Poziom', '레벨'],
    'tb.lvlAll': ['Wszystkie', '전체'],
    'mt.corners': ['Kąciki A1 i study tips', '입문 코너와 공부 팁'],
    'mt.cornersSub': ['Otwarte czaty bez presji: Koreański A1, Polski A1 oraz porady do nauki.', '부담 없는 오픈 채팅: 한국어 A1, 폴란드어 A1, 공부 팁.'],
    'tb.plClub': ['Rozmowy po polsku', '폴란드어 대화'],
    'tb.plClubSub': ['Szukasz rozmów po polsku? Dołącz do klubu Rozmowy po polsku (Premium).', '폴란드어로 대화하고 싶다면 폴란드어 대화 클럽(프리미엄)에 참여해 보세요.'],
    'tb.sec.free': ['Bezpłatny stolik sezonowy', '무료 시즌 테이블'],
    'mt.all': ['Zobacz wszystkie stoliki', '모든 테이블 보기'],
    'mt.none': ['Stolik próbny na Twoim poziomie jest teraz pełny. Zapisz się na listę, a damy znać.', '내 레벨의 체험 테이블이 가득 찼어요. 대기 명단에 등록해 주세요.'],
    'welcome.trial': ['Pogaduszki są za darmo, a każdy stolik ma 7 dni za darmo. Premium (29 zł/mies.) otwiera wszystkie kluby (K-dramy, K-pop taniec, Polski dla Koreańczyków) i wydarzenia.', '수다방은 무료이고, 모든 테이블은 7일 무료예요. 프리미엄(월 29 zł)은 모든 클럽(K-드라마, 케이팝 댄스, 한국인을 위한 폴란드어)과 이벤트를 열어 줘요.'],
    'profile.planCta': ['Odblokuj stoliki sezonowe i rozmowy na żywo', '시즌 테이블과 라이브 대화 열기'],
    'pay.lead': ['Kluby K-dram i K-pop taniec oraz wydarzenia w jednej subskrypcji.', 'K-드라마 클럽, 케이팝 댄스, 이벤트를 하나의 구독으로.'],
    'pay.b1': ['Klub K-dram i K-pop taniec po polsku', 'K-드라마 클럽과 케이팝 댄스 클럽(폴란드어)'],
    'pay.b2': ['Wydarzenia tematyczne na żywo', '주제별 라이브 이벤트'],

    /* Twoja droga */
    'jr.title': ['Twoja droga', '나의 여정'],
    'jr.s1': ['Lada', '접수대'],
    'jr.s2': ['Stolik', '테이블'],
    'jr.s3': ['Odpowiedzi', '답변'],
    'jr.s4': ['Zapis na live', '라이브 신청'],
    'jr.s5': ['Sezon', '시즌'],
    'jr.hint1': ['Zacznij od Lady: 2 minuty o tym, czego się uczysz.', '접수대에서 시작해요. 2분이면 돼요.'],
    'jr.hint2': ['Wybierz stolik według poziomu.', '레벨에 맞는 테이블을 골라요.'],
    'jr.hint3': ['Odpowiedz stolikowi 5 razy, żeby się rozgrzać.', '테이블에 답변을 5번 남겨 워밍업해요.'],
    'jr.hint4': ['Wybierz termin rozmowy na żywo przy swoim stoliku.', '내 테이블에서 라이브 대화 시간을 골라요.'],
    'jr.hint5': ['Spodobało się? Zostań z grupą w Stoliku sezonowym.', '마음에 들었다면 시즌 테이블에서 같은 그룹과 계속해요.'],
    'jr.done': ['Jesteś na drodze do rozmowy na żywo. Tak trzymać!', '라이브 대화까지 잘 가고 있어요!'],

    /* Kącik A1 */
    'corner.title': ['Kącik A1', 'A1 코너'],
    'corner.body': ['Cichy kącik dla początkujących: gotowe zdania i gospodarz, który poprawia. Bez presji i bez limitu czasu.', '초급자를 위한 조용한 코너예요. 문장 틀과 고쳐 주는 진행자가 있어요. 부담도 시간 제한도 없어요.'],
    'corner.kr': ['Koreański A1', '한국어 A1'],
    'corner.pl': ['Polski A1', '폴란드어 A1'],

    /* Lada */
    'lada.title': ['Lada', '접수대'],
    'lada.sub': ['Dwie minuty, żebyśmy wiedzieli, gdzie Cię posadzić.', '2분이면 돼요. 어디에 앉으면 좋을지 알려 드릴게요.'],
    'lada.q1': ['Czego się uczysz?', '무엇을 배우나요?'],
    'lada.dir.ko': ['Uczę się koreańskiego', '한국어를 배워요'],
    'lada.dir.pl': ['Uczę się polskiego', '폴란드어를 배워요'],
    'lada.q2': ['Na jakim poziomie piszesz swobodnie?', '편하게 쓸 수 있는 레벨은?'],
    'lada.q3': ['Co lubisz? (możesz kilka)', '관심사를 골라요 (여러 개 가능)'],
    'lada.q4': ['Kiedy możesz rozmawiać na żywo?', '언제 라이브 대화가 가능해요?'],
    'lada.slot.am': ['Weekend, przedpołudnie (czas PL)', '주말 오전 (폴란드 시간)'],
    'lada.slot.pm': ['Weekend, po południu (czas PL)', '주말 오후 (폴란드 시간)'],
    'lada.slot.eve': ['Wieczory w tygodniu (czas PL)', '평일 저녁 (폴란드 시간)'],
    'lada.slotNote': ['Rozmowy z Koreą są możliwe głównie w weekendowe przedpołudnia czasu polskiego, bo wtedy w Seulu jest wieczór.', '한국과의 대화는 주로 폴란드 주말 오전에 가능해요. 서울은 그때 저녁이에요.'],
    'lada.done': ['Gotowe, pokaż stoliki', '완료, 테이블 보기'],
    'lada.skip': ['Pomiń na razie', '나중에 할게요'],
    'lada.need': ['Wybierz język i poziom, żeby przejść dalej.', '언어와 레벨을 고르면 다음으로 갈 수 있어요.'],
    'lada.ready': ['Zapisane. Stoliki dobrane do Ciebie są na górze.', '저장했어요. 맞는 테이블을 위에 보여 드려요.'],
    'lada.edit': ['Zmień odpowiedzi z Lady', '접수대 답변 수정'],
    'lada.cta': ['Zacznij od Lady (2 min)', '접수대에서 시작하기 (2분)'],
    'lada.ctaBody': ['Powiedz, czego się uczysz, a wskażemy stolik, który do Ciebie pasuje.', '배우는 언어를 알려 주면 맞는 테이블을 안내해 드려요.'],

    /* Stoliki */
    'tb.title': ['Stoliki', '테이블'],
    'tb.sub': ['małe grupy 4-6 osób, wspólne hobby, finał na żywo', '4~6명 소그룹, 같은 취미, 마지막은 라이브'],
    'tb.sec.mine': ['Twoje stoliki', '내 테이블'],
    'tb.sec.trial': ['Stoliki próbne · 7 dni, za darmo', '체험 테이블 · 7일 무료'],
    'tb.sec.season': ['Stoliki sezonowe · 4 tygodnie', '시즌 테이블 · 4주'],
    'tb.sec.open': ['Stoliki dnia · otwarte 24/7', '오늘의 테이블 · 24시간 열림'],
    'tb.open.sub': ['Temat dnia jest za darmo: wejdź, odpowiedz na pytanie dnia i wyjdź, kiedy chcesz. Pozostałe stoliki 24/7 otworzymy z listy oczekujących.', '오늘의 주제는 무료예요. 들어와서 오늘의 질문에 답하고 언제든 나가세요. 나머지 24/7 테이블은 대기 명단 순서로 열어요.'],
    'tb.tag.trial': ['PRÓBNY 7 DNI', '체험 7일'],
    'tb.tag.season': ['SEZON 4 TYG.', '시즌 4주'],
    'tb.seats': ['{n} z {m} miejsc zajętych', '{m}석 중 {n}석 참석'],
    'tb.week': ['Tydzień {n} z 4', '{n}주차 / 4'],
    'tb.day': ['Dzień {n} z 7', '{n}일차 / 7'],
    'tb.match': ['Pasuje do Ciebie', '나에게 맞아요'],
    'tb.full': ['Komplet · lista oczekujących', '마감 · 대기자 명단'],
    'tb.joined': ['Jesteś tu', '참여 중'],
    'tb.joinTrial': ['Dołącz na 7 dni za darmo', '7일 무료로 참여'],
    'tb.joinSeason': ['Dołącz do sezonu', '시즌 참여하기'],
    'tb.joinedToast': ['Jesteś przy stoliku. Powitaj ludzi trzema słowami o sobie.', '테이블에 앉았어요. 나를 세 단어로 소개해 보세요.'],
    'tb.leave': ['Opuść stolik', '테이블 나가기'],
    'tb.leftToast': ['Opuszczono stolik.', '테이블을 나갔어요.'],
    'tb.preview': ['Podgląd: dołącz, żeby pisać przy tym stoliku.', '미리보기: 참여하면 이 테이블에 글을 쓸 수 있어요.'],
    'tb.notFound': ['Nie znaleziono tego stolika.', '이 테이블을 찾을 수 없어요.'],
    'tb.noDm': ['Wiadomości prywatne między osobami przy stoliku otwierają się dopiero po wspólnej rozmowie na żywo.', '테이블 멤버끼리의 개인 메시지는 함께 라이브 대화를 한 뒤에 열려요.'],
    'tb.host': ['Gospodarz', '진행자'],
    'tb.members': ['Przy stoliku', '테이블 멤버'],
    'tb.you': ['Ty', '나'],
    'demo.tables': ['Tryb demo: stoliki, osoby i liczby są przykładowe. Koreańskie teksty do sprawdzenia przez native speakera.', '데모 모드: 테이블, 사람, 숫자는 예시예요. 한국어 문장은 원어민 확인이 필요해요.'],

    /* szczegóły stolika */
    'td.warm': ['Ciepło stolika', '테이블 온기'],
    'td.warm.good': ['Ciepły stolik', '따뜻한 테이블'],
    'td.warm.ok': ['Jeszcze się rozgrzewa', '아직 데워지는 중'],
    'td.warmNote': ['{n}% osób odpowiedziało w tym tygodniu. Wspólny cel: 70%.', '이번 주 {n}%가 참여했어요. 함께 목표: 70%.'],
    'wk.1': ['Powitanie', '인사'],
    'wk.2': ['Rytm', '리듬'],
    'wk.3': ['Zapis na live', '라이브 신청'],
    'wk.4': ['Live', '라이브'],
    'td.season': ['Sezon', '시즌'],
    'td.trial': ['Próba', '체험'],

    /* rytm tygodnia i prompty */
    'rh.title': ['Rytm tygodnia', '주간 리듬'],
    'rh.show': ['Pokaż', '보여 주기'],
    'rh.choose': ['Wybierz', '고르기'],
    'rh.mission': ['Misja dnia', '오늘의 미션'],
    'rh.ask': ['Zapytaj stolik', '테이블에 질문'],
    'rh.voice': ['Nagranie 15 s', '15초 녹음'],
    'rh.live': ['Luz', '자유'],
    'rh.show.s': ['Pokaż', '보기'],
    'rh.choose.s': ['Wybierz', '고르기'],
    'rh.mission.s': ['Misja', '미션'],
    'rh.ask.s': ['Pytanie', '질문'],
    'rh.voice.s': ['Głos', '목소리'],
    'rh.live.s': ['Luz', '자유'],
    'pr.today': ['Prompt na dziś', '오늘의 프롬프트'],
    'pr.frame': ['Szkielet zdania', '문장 틀'],
    'pr.useFrame': ['Wstaw szkielet', '틀 넣기'],
    'pr.weekend': ['Weekend jest wolny od promptów. Pisz, o czym chcesz. Rozmowa live odbywa się raz w miesiącu, termin znajdziesz niżej.', '주말에는 프롬프트가 없어요. 자유롭게 써 보세요. 라이브는 한 달에 한 번이에요. 일정은 아래에서 확인하세요.'],
    'pr.voiceBtn': ['Nagraj 15 s (wkrótce)', '15초 녹음 (곧 공개)'],
    'pr.voiceSoon': ['Nagrania głosowe dodamy w kolejnym kroku. Na razie odpowiedz tekstem.', '음성 녹음은 곧 추가돼요. 지금은 글로 답해 주세요.'],
    'pr.voiceNote': ['Nagrania będą słyszeć tylko osoby z Twojego stolika. Możesz nagrać ponownie.', '녹음은 같은 테이블 사람들만 들을 수 있어요. 다시 녹음할 수 있어요.'],
    'xp.hint': ['XP: odpowiedź (min. 4 słowa) +10, kolejne tego dnia mniej. Pytanie do stolika: bonus +5.', 'XP: 4단어 이상 답변 +10, 같은 날 추가는 점점 적어져요. 테이블에 질문하면 보너스 +5.'],
    'xp.today': ['Dziś: {n} z 3 nagradzanych wpisów', '오늘 {n}/3 XP 받음'],
    'xp.earned': ['+{n} XP za odpowiedź', '답변 +{n} XP'],
    'xp.earnedBonus': ['+{n} XP, w tym bonus za pytanie do stolika', '+{n} XP (질문 보너스 포함)'],
    'xp.cap': ['Na dziś komplet punktów. Pisz dalej, jeśli masz ochotę.', '오늘 XP는 다 채웠어요. 계속 써도 좋아요.'],

    /* tygodniowy rytm i zamrożenia */
    'wr.title': ['Twój tydzień', '이번 주'],
    'wr.count': ['{n} z 3 dni', '{n}/3일'],
    'wr.frozen': ['Zamrożone', '얼려 둠'],
    'wr.ok': ['Seria tygodnia utrzymana. Wystarczą 3 dni z 7.', '이번 주 기록 유지 중. 7일 중 3일이면 충분해요.'],
    'wr.rule': ['Seria tygodnia: wystarczą 3 dni aktywności z 7.', '주간 기록: 7일 중 3일만 활동하면 돼요.'],
    'wr.freeze': ['Zamroź serię', '기록 얼리기'],
    'wr.freezeLeft': ['zostały {n} w tym miesiącu', '이번 달 {n}번 남음'],
    'wr.none': ['brak zamrożeń w tym miesiącu', '이번 달 남은 횟수 없음'],
    'wr.frozenToast': ['Seria zamrożona do końca tygodnia.', '이번 주 기록을 얼렸어요.'],

    /* rozmowa na żywo stolika */
    'lv.title': ['Rozmowa na żywo', '라이브 대화'],
    'lv.sub': ['25 minut audio z ludźmi ze stolika. Kamera jest opcjonalna.', '테이블 사람들과 25분 오디오 대화. 카메라는 선택이에요.'],
    'lv.vote': ['Wybierz termin, który Ci pasuje', '가능한 시간을 골라요'],
    'lv.voted': ['Twoje miejsce przy stoliku jest zarezerwowane', '자리가 예약되었어요'],
    'lv.remind': ['Dostaniesz przypomnienia 24 godziny i 1 godzinę przed rozmową (po dodaniu do kalendarza).', '캘린더에 추가하면 대화 24시간 전과 1시간 전에 알려 드려요.'],
    'lv.ics': ['Dodaj do kalendarza', '캘린더에 추가'],
    'lv.change': ['Zmień termin', '시간 바꾸기'],
    'lv.plan': ['Plan rozmowy', '대화 진행'],
    'lv.p1': ['5 min: rozgrzewka, każdy mówi jedno zdanie', '5분: 워밍업, 한 문장씩 말해요'],
    'lv.p2': ['15 min: pytania ze stolika, 90 sekund na odpowiedź', '15분: 테이블 질문, 답변은 90초'],
    'lv.p3': ['5 min: podsumowanie i termin następnej rozmowy', '5분: 정리와 다음 대화 시간'],
    'lv.r1': ['Mikrofon i kamera domyślnie wyłączone: włączasz, kiedy chcesz.', '마이크와 카메라는 기본으로 꺼져 있어요. 원할 때 켜요.'],
    'lv.times': ['Wszystkie godziny: czas polski i koreański', '시간은 폴란드와 한국 시간 모두 표시돼요'],

    /* Sala live */
    'hall.title': ['Sala live', '라이브 룸'],
    'hall.sub': ['25 minut mówienia z ludźmi, których już znasz', '이미 아는 사람들과 25분 말하기'],
    'hall.ritual': ['Stały termin: weekend, przedpołudnie czasu polskiego', '고정 시간: 주말 오전 (폴란드 시간)'],
    'hall.why': ['Wtedy w Korei jest wieczór: zimą 11:00 w Warszawie to 19:00 w Seulu, latem 18:00.', '그때 한국은 저녁이에요. 겨울에는 바르샤바 11:00가 서울 19:00, 여름에는 18:00예요.'],
    'hall.mine': ['Twoje zapisy', '내 신청'],
    'hall.noMine': ['Nie masz jeszcze zapisu. Wybierz termin przy swoim stoliku.', '아직 신청이 없어요. 내 테이블에서 시간을 골라요.'],
    'hall.toTables': ['Przejdź do stolików', '테이블 보기'],
    'hall.sched': ['Rozmowy otwarte dla wszystkich', '누구나 참여하는 대화'],
    'hall.events': ['Wszystkie wydarzenia', '모든 이벤트']
  });

  /* osoby z przykładowych stolików */
  D.people = [
    { n: 'Ania', c: 'Kraków', nat: 'PL', w: { pl: 'K-pop · kawa · noc', ko: '케이팝 · 커피 · 밤' } },
    { n: 'Minji', c: '서울', nat: 'KR', w: { pl: 'dramy · kawa · spacery', ko: '드라마 · 커피 · 산책' } },
    { n: 'Kasia', c: 'Wrocław', nat: 'PL', w: { pl: 'seriale · koty · herbata', ko: '드라마 · 고양이 · 차' } },
    { n: 'Jihoon', c: '부산', nat: 'KR', w: { pl: 'gotowanie · filmy · podróże', ko: '요리 · 영화 · 여행' } },
    { n: 'Tomek', c: 'Warszawa', nat: 'PL', w: { pl: 'podróże · kawa · rower', ko: '여행 · 커피 · 자전거' } },
    { n: 'Seoyeon', c: '서울', nat: 'KR', w: { pl: 'taniec · K-pop · zdjęcia', ko: '춤 · 케이팝 · 사진' } }
  ];

  /* szkielety zdań dla poziomów A1-A2 (w języku, którego się uczysz) */
  D.frames = {
    show: { ko: '사진에는 ___이/가 있어요. ___ 때문에 좋아해요.', pl: 'Na zdjęciu jest ___. Lubię to, bo ___.' },
    choose: { ko: '저는 ___이/가 더 좋아요. 왜냐하면 ___.', pl: 'Wolę ___, bo ___.' },
    mission: { ko: '오늘 ___을/를 봤어요. ___ 같아요.', pl: 'Dziś zobaczyłem(-am) ___. Wygląda jak ___.' },
    ask: { ko: '여러분은 ___을/를 좋아해요? 왜요?', pl: 'Czy lubicie ___? Dlaczego?' },
    voice: { ko: '안녕하세요, 저는 ___예요. 오늘은 ___ 이야기를 할게요.', pl: 'Cześć, jestem ___. Dziś opowiem o ___.' }
  };

  /* stałe terminy rozmów na żywo: weekendowe przedpołudnia czasu polskiego (wieczór w Korei) */
  D.liveOpts = [{ dow: 6, time: '11:00' }, { dow: 0, time: '11:00' }, { dow: 6, time: '12:30' }];
  D.liveDur = 25;

  D.tables = [
    {
      id: 'probny-kdrama', kind: 'trial', hobbyId: 'kdrama', name: { pl: 'Stolik K-dramowy', ko: 'K-드라마 테이블' },
      levels: ['A2', 'B1'], level: { pl: 'A2–B1', ko: 'A2–B1' }, seats: 6, members: [1, 2, 4, 0], host: 1, day: 3, warmth: 58,
      prompts: {
        show: { pl: 'Zrób zdjęcie ekranu z ulubioną sceną i opisz ją jednym zdaniem.', ko: '좋아하는 장면 화면을 찍고 한 문장으로 설명해 보세요.' },
        choose: { pl: 'Wolisz romans czy thriller? Dlaczego?', ko: '로맨스와 스릴러 중에 뭐가 더 좋아요? 왜요?' },
        mission: { pl: 'Zapisz jedną frazę z odcinka, który dziś oglądasz.', ko: '오늘 보는 에피소드에서 마음에 든 표현을 하나 적어 보세요.' },
        ask: { pl: 'Zadaj stolikowi pytanie o serial, który polecisz.', ko: '추천하고 싶은 드라마에 대해 테이블에 질문해 보세요.' },
        voice: { pl: 'Nagraj 15 sekund: jak nazywa się Twój ulubiony serial i dlaczego?', ko: '15초 녹음: 제일 좋아하는 드라마 이름과 이유를 말해 보세요.' }
      }
    },
    {
      id: 'probny-kuchnia', kind: 'trial', hobbyId: 'food', name: { pl: 'Stolik kuchenny', ko: '요리 테이블' },
      levels: ['A1', 'A2'], level: { pl: 'A1–A2', ko: 'A1–A2' }, seats: 6, members: [3, 0, 2], host: 3, day: 5, warmth: 64,
      prompts: {
        show: { pl: 'Pokaż, co dziś jadłeś(-aś), i napisz, jak to się nazywa.', ko: '오늘 먹은 음식을 보여 주고 이름을 써 보세요.' },
        choose: { pl: 'Ostre czy łagodne? Dlaczego?', ko: '매운 음식과 순한 음식 중에 뭐가 좋아요? 왜요?' },
        mission: { pl: 'Zapisz trzy składniki, które masz dziś w lodówce.', ko: '오늘 냉장고에 있는 재료 세 가지를 써 보세요.' },
        ask: { pl: 'Zapytaj stolik o ulubiony przepis.', ko: '테이블 사람들에게 좋아하는 요리법을 물어보세요.' },
        voice: { pl: 'Nagraj 15 sekund: Twoje ulubione danie.', ko: '15초 녹음: 제일 좋아하는 음식을 소개해 보세요.' }
      }
    },
    {
      id: 'sezon-kpop', kind: 'season', hobbyId: 'kpop', name: { pl: 'K-pop i taniec', ko: '케이팝과 춤' },
      levels: ['A2', 'B1', 'B2'], level: { pl: 'A2–B2', ko: 'A2–B2' }, seats: 6, members: [5, 0, 2, 4, 1], host: 5, week: 2, warmth: 71,
      prompts: {
        show: { pl: 'Pokaż piosenkę tygodnia i napisz, dlaczego ją lubisz.', ko: '이번 주 노래를 보여 주고 좋아하는 이유를 써 보세요.' },
        choose: { pl: 'Choreografia czy tekst piosenki: co jest dla Ciebie ważniejsze?', ko: '안무와 가사 중에 뭐가 더 중요해요?' },
        mission: { pl: 'Zapisz jedno słowo z piosenki, którego się dziś nauczyłeś(-aś).', ko: '오늘 노래에서 새로 배운 단어를 하나 써 보세요.' },
        ask: { pl: 'Zapytaj stolik o pierwszy koncert w ich życiu.', ko: '테이블 사람들에게 첫 콘서트에 대해 물어보세요.' },
        voice: { pl: 'Nagraj 15 sekund: przedstaw swojego ulubionego artystę.', ko: '15초 녹음: 좋아하는 가수를 소개해 보세요.' }
      }
    },
    {
      id: 'sezon-podroze', kind: 'season', hobbyId: 'travel', name: { pl: 'Podróże po Korei', ko: '한국 여행' },
      levels: ['B1', 'B2', 'C1'], level: { pl: 'B1–C1', ko: 'B1–C1' }, seats: 6, members: [3, 4, 1, 2], host: 3, week: 1, warmth: 55,
      prompts: {
        show: { pl: 'Pokaż miejsce w Korei, do którego chcesz pojechać.', ko: '한국에서 가 보고 싶은 곳을 보여 주세요.' },
        choose: { pl: 'Seul czy Busan? Dlaczego?', ko: '서울과 부산 중에 어디가 좋아요? 왜요?' },
        mission: { pl: 'Zaplanuj w trzech zdaniach jeden dzień w Korei.', ko: '한국에서 보내는 하루를 세 문장으로 계획해 보세요.' },
        ask: { pl: 'Zapytaj stolik, co koniecznie zjeść w podróży.', ko: '여행에서 꼭 먹어야 할 음식을 테이블에 물어보세요.' },
        voice: { pl: 'Nagraj 15 sekund: dokąd pojedziesz w Korei i dlaczego?', ko: '15초 녹음: 한국에서 어디에 가고 싶고 왜인지 말해 보세요.' }
      }
    }
  ];

  /* nowy kanał: polski dla początkujących (Koreańczycy A1-A2), obok koreańskiego A1 */
  D.channels.splice(1, 0, {
    id: 'pl-a1', badge: 'PL', lang: 'PL', topic: 'language', premium: false,
    levels: ['A1', 'A2'], level: { pl: 'A1–A2', ko: 'A1–A2' }, ages: ['18-25', '26-35', '36+'],
    name: { pl: 'Polski dla początkujących', ko: '폴란드어 초급' },
    desc: { pl: 'pisz po polsku, Polacy poprawiają', ko: '폴란드어로 써 보세요' },
    rule: { pl: 'Pisz po polsku, a Polacy poprawiają.', ko: '폴란드어로 써 보세요. 원어민이 고쳐 줘요.' },
    practice: [
      { pl: 'Jak masz na imię?', k: '이름이 뭐예요?', starter: 'Mam na imię ___.' },
      { pl: 'Skąd jesteś?', k: '어디에서 왔어요?', starter: 'Jestem z ___.' },
      { pl: 'Co lubisz jeść?', k: '무슨 음식을 좋아해요?', starter: 'Lubię ___.' },
      { pl: 'Jak się dziś czujesz?', k: '오늘 기분이 어때요?', starter: 'Dziś czuję się ___.' },
      { pl: 'Co robisz w weekend?', k: '주말에 뭐 해요?', starter: 'W weekend ___.' },
      { pl: 'Jakiej muzyki lubisz słuchać?', k: '어떤 음악을 좋아해요?', starter: 'Lubię słuchać ___.' },
      { pl: 'Wolisz kawę czy herbatę?', k: '커피를 좋아해요, 차를 좋아해요?', starter: 'Wolę ___.' },
      { pl: 'Jaka jest dziś pogoda?', k: '오늘 날씨가 어때요?', starter: 'Dziś jest ___.' }
    ]
  });


  /* ---------- Pogaduszki: tylko Kąciki A1 i Study tips; reszta jako Stoliki sezonowe ---------- */
  D.channels.forEach(function (c) { if (['kr-adv', 'pl-b1', 'korea-life', 'poland-life'].indexOf(c.id) >= 0) c.hidden = true; });
  D.tables.push(
    { id: 'sezon-rozmowy-kr', kind: 'season', hobbyId: 'language', name: { pl: 'Rozmowy po koreańsku', ko: '한국어 대화' }, levels: ['B1', 'B2', 'C1'], level: { pl: 'B1–C1', ko: 'B1–C1' }, seats: 6, members: [1, 3, 5, 2], host: 1, week: 2, warmth: 66,
      prompts: { show: { pl: 'Wklej jedno zdanie po koreańsku, z którego jesteś dziś dumny(-a).', ko: '오늘 가장 뿌듯했던 한국어 문장을 하나 써 보세요.' }, choose: { pl: 'Wolisz pisać czy mówić po koreańsku? Dlaczego?', ko: '한국어는 쓰는 게 좋아요, 말하는 게 좋아요? 왜요?' }, mission: { pl: 'Opisz swój dzień w pięciu zdaniach, bez słownika.', ko: '오늘 하루를 사전 없이 다섯 문장으로 써 보세요.' }, ask: { pl: 'Zapytaj stolik o wyrażenie, którego nie rozumiesz.', ko: '이해가 안 되는 표현을 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: opowiedz o swojej najśmieszniejszej pomyłce po koreańsku.', ko: '15초 녹음: 한국어로 했던 제일 웃긴 실수를 이야기해 보세요.' } } },
    { id: 'sezon-polski-b1', kind: 'season', hobbyId: 'language', name: { pl: 'Polski dla Koreańczyków', ko: '폴란드어 중급' }, levels: ['B1', 'B2'], level: { pl: 'B1–B2', ko: 'B1–B2' }, seats: 6, members: [0, 2, 1, 5], host: 0, week: 3, warmth: 61,
      prompts: { show: { pl: 'Napisz jedno polskie słowo, które lubisz najbardziej.', ko: '제일 좋아하는 폴란드어 단어를 하나 써 보세요.' }, choose: { pl: 'Polski czy koreański: który język jest trudniejszy?', ko: '폴란드어와 한국어 중 어느 쪽이 더 어려워요?' }, mission: { pl: 'Napisz trzy zdania o swoim ostatnim weekendzie.', ko: '지난 주말에 대해 세 문장으로 써 보세요.' }, ask: { pl: 'Zapytaj stolik, jak powiedzieć coś po polsku.', ko: '폴란드어로 어떻게 말하는지 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: przedstaw się po polsku.', ko: '15초 녹음: 폴란드어로 자기소개를 해 보세요.' } } },
    { id: 'sezon-zycie-kr', kind: 'season', hobbyId: 'travel', name: { pl: 'Życie w Korei', ko: '한국 생활' }, levels: ['A2', 'B1', 'B2'], level: { pl: 'A2–B2', ko: 'A2–B2' }, seats: 6, members: [3, 4, 1], host: 3, week: 1, warmth: 52,
      prompts: { show: { pl: 'Pokaż rzecz, która zaskoczyła Cię w Korei.', ko: '한국에서 놀랐던 것을 보여 주세요.' }, choose: { pl: 'Metro czy autobus w Seulu? Dlaczego?', ko: '서울에서 지하철과 버스 중에 뭐가 좋아요? 왜요?' }, mission: { pl: 'Zapisz po koreańsku jedną frazę przydatną w kawiarni.', ko: '카페에서 쓸 수 있는 표현을 하나 써 보세요.' }, ask: { pl: 'Zapytaj stolik o najlepszy kawiarniany nawyk w Korei.', ko: '한국 카페 문화에서 좋았던 점을 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: jak wygląda Twój dzień w Korei (lub jak chciał(a)byś go spędzić).', ko: '15초 녹음: 한국에서의 하루를 이야기해 보세요.' } } },
    { id: 'sezon-zycie-pl', kind: 'season', hobbyId: 'history', name: { pl: 'Życie w Polsce', ko: '폴란드 생활' }, levels: ['A2', 'B1', 'B2'], level: { pl: 'A2–B2', ko: 'A2–B2' }, seats: 6, members: [0, 2, 5], host: 0, week: 1, warmth: 49,
      prompts: { show: { pl: 'Pokaż polskie jedzenie, które trzeba spróbować.', ko: '꼭 먹어 봐야 할 폴란드 음식을 보여 주세요.' }, choose: { pl: 'Pierogi czy żurek? Dlaczego?', ko: '피에로기와 주렉 중에 뭐가 좋아요? 왜요?' }, mission: { pl: 'Zapisz po polsku jedno zdanie o swoim mieście.', ko: '폴란드어로 우리 도시에 대한 문장을 하나 써 보세요.' }, ask: { pl: 'Zapytaj stolik o polską tradycję, której nie znasz.', ko: '잘 모르는 폴란드 전통을 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: opowiedz o polskim święcie.', ko: '15초 녹음: 폴란드 명절에 대해 이야기해 보세요.' } } }
  );
  /* ---------- poziomy: próbne stoliki według poziomu, sezony według poziomu × tematu ---------- */
  D.tables = D.tables.filter(function (x) { return x.kind !== 'trial'; });
  D.tables.unshift(
    { id: 'probny-beginner', kind: 'trial', track: 'beginner', hobbyId: 'level-beginner', name: { pl: 'Stolik początkujący', ko: '초급 테이블' }, levels: ['A1', 'A2'], level: { pl: 'Beginner A1–A2', ko: '초급 A1–A2' }, seats: 6, members: [1, 2, 3, 0], host: 1, day: 3, warmth: 58,
      prompts: { show: { pl: 'Pokaż zdjęcie czegoś, co dziś zjadłeś(-aś) lub wypiłeś(-aś), i nazwij to.', ko: '오늘 먹거나 마신 것을 보여 주고 이름을 써 보세요.' }, choose: { pl: 'Kawa czy herbata? Dlaczego?', ko: '커피와 차 중에 뭐가 좋아요? 왜요?' }, mission: { pl: 'Zapisz trzy słowa, których dziś użyłeś(-aś).', ko: '오늘 쓴 단어 세 개를 써 보세요.' }, ask: { pl: 'Zapytaj stolik, co lubią robić w weekend.', ko: '주말에 뭐 하는 걸 좋아하는지 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: przedstaw się.', ko: '15초 녹음: 자기소개를 해 보세요.' } } },
    { id: 'probny-intermediate', kind: 'trial', track: 'intermediate', hobbyId: 'level-intermediate', name: { pl: 'Stolik średni', ko: '중급 테이블' }, levels: ['A2', 'B1'], level: { pl: 'Intermediate A2–B1', ko: '중급 A2–B1' }, seats: 6, members: [3, 4, 5, 2], host: 3, day: 5, warmth: 64,
      prompts: { show: { pl: 'Pokaż miejsce, które lubisz w swoim mieście, i napisz dlaczego.', ko: '우리 도시에서 좋아하는 장소를 보여 주고 이유를 써 보세요.' }, choose: { pl: 'Wolisz poranki czy wieczory? Uzasadnij w dwóch zdaniach.', ko: '아침형이에요, 저녁형이에요? 두 문장으로 이유를 써 보세요.' }, mission: { pl: 'Opisz swój dzień w czterech zdaniach.', ko: '오늘 하루를 네 문장으로 써 보세요.' }, ask: { pl: 'Zapytaj stolik o ich ulubione miejsce na odpoczynek.', ko: '쉬기 좋은 장소를 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: opowiedz o swoim ostatnim weekendzie.', ko: '15초 녹음: 지난 주말에 대해 이야기해 보세요.' } } },
    { id: 'probny-advanced', kind: 'trial', track: 'advanced', hobbyId: 'level-advanced', name: { pl: 'Stolik zaawansowany', ko: '고급 테이블' }, levels: ['B2', 'C1', 'C2'], level: { pl: 'Advanced B2+', ko: '고급 B2+' }, seats: 6, members: [1, 4, 0], host: 4, day: 2, warmth: 52,
      prompts: { show: { pl: 'Wklej cytat lub zdanie, które ostatnio dało Ci do myślenia.', ko: '최근 생각하게 만든 문장이나 인용을 하나 써 보세요.' }, choose: { pl: 'Czy nauka języka zmienia sposób myślenia? Podaj argument.', ko: '언어를 배우면 생각하는 방식이 바뀔까요? 근거를 들어 보세요.' }, mission: { pl: 'Napisz krótką opinię (5 zdań) o czymś, co ostatnio czytałeś(-aś).', ko: '최근 읽은 것에 대한 짧은 의견을 다섯 문장으로 써 보세요.' }, ask: { pl: 'Zapytaj stolik o ich zdanie w sprawie, w której się wahasz.', ko: '고민 중인 주제에 대해 테이블의 생각을 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: bronisz niepopularnej opinii.', ko: '15초 녹음: 인기 없는 의견을 변호해 보세요.' } } }
  );
  var TRACK = {
    beginner: { levels: ['A1', 'A2'], pl: 'Beginner A1–A2', ko: '초급 A1–A2' },
    intermediate: { levels: ['A2', 'B1'], pl: 'Intermediate A2–B1', ko: '중급 A2–B1' },
    advanced: { levels: ['B2', 'C1', 'C2'], pl: 'Advanced B2+', ko: '고급 B2+' }
  };
  /* sezony: 3 stoliki według poziomu (jak próbne) + tematyczne bez zmian */
  /* sezony tematyczne: 15 klubów i tematów */
  D.tables = D.tables.filter(function (x) { return !(x.kind === 'season' && !/^level-/.test(x.hobbyId)); });
  D.tables.push(
    { id: 'sezon-fandoms', kind: 'season', hobbyId: 'fandoms', name: { pl: 'Fandomy', ko: '팬덤' }, levels: ['A2', 'B1', 'B2'], level: { pl: 'A2–B2', ko: 'A2–B2' }, seats: 6, members: [5, 0, 2, 4], host: 5, week: 2, warmth: 66,
      prompts: { show: { pl: 'Pokaż coś ze swojego fandomu (zdjęcie, kartę, cytat) i napisz, dlaczego to dla Ciebie ważne.', ko: '내 팬덤의 물건(사진, 포토카드, 문장)을 보여 주고 왜 소중한지 써 보세요.' }, choose: { pl: 'Koncert czy fanmeeting: co wolisz?', ko: '콘서트와 팬미팅 중에 뭐가 더 좋아요?' }, mission: { pl: 'Zapisz po koreańsku jedno hasło fanowskie i wyjaśnij je.', ko: '팬덤에서 쓰는 말을 하나 써 보고 뜻을 설명해 보세요.' }, ask: { pl: 'Zapytaj stolik, jak zostali fanami.', ko: '어떻게 팬이 됐는지 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: przedstaw swojego ulubionego artystę lub serial.', ko: '15초 녹음: 좋아하는 아티스트나 작품을 소개해 보세요.' } } },
    { id: 'sezon-book-club', kind: 'season', hobbyId: 'book-club', name: { pl: 'Klub książki', ko: '북클럽' }, levels: ['B1', 'B2', 'C1'], level: { pl: 'B1–C1', ko: 'B1–C1' }, seats: 6, members: [1, 3, 4, 2], host: 1, week: 1, warmth: 60,
      prompts: { show: { pl: 'Wklej jedno zdanie z książki, którą teraz czytasz.', ko: '지금 읽고 있는 책에서 마음에 드는 문장을 하나 써 보세요.' }, choose: { pl: 'Papier czy e-book? Dlaczego?', ko: '종이책과 전자책 중에 뭐가 좋아요? 왜요?' }, mission: { pl: 'Opisz w trzech zdaniach bohatera ostatniej książki.', ko: '최근 읽은 책의 주인공을 세 문장으로 소개해 보세요.' }, ask: { pl: 'Zapytaj stolik o książkę, którą polecą.', ko: '추천하고 싶은 책을 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: poleć jedną książkę.', ko: '15초 녹음: 책을 한 권 추천해 보세요.' } } },
    { id: 'sezon-kdrama-club', kind: 'season', hobbyId: 'kdrama-club', name: { pl: 'Klub K-dram', ko: 'K-드라마 클럽' }, levels: ['A2', 'B1', 'B2'], level: { pl: 'A2–B2', ko: 'A2–B2' }, seats: 6, members: [1, 2, 4, 0], host: 1, week: 3, warmth: 72,
      prompts: { show: { pl: 'Zrób zdjęcie ekranu z ulubioną sceną i opisz ją jednym zdaniem.', ko: '좋아하는 장면 화면을 찍고 한 문장으로 설명해 보세요.' }, choose: { pl: 'Romans czy thriller? Dlaczego?', ko: '로맨스와 스릴러 중에 뭐가 더 좋아요? 왜요?' }, mission: { pl: 'Zapisz jedną frazę z odcinka, który dziś oglądasz.', ko: '오늘 보는 에피소드에서 마음에 든 표현을 하나 적어 보세요.' }, ask: { pl: 'Zapytaj stolik o serial, który polecą.', ko: '추천하고 싶은 드라마를 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: Twój ulubiony serial i dlaczego.', ko: '15초 녹음: 제일 좋아하는 드라마와 이유를 말해 보세요.' } } },
    { id: 'sezon-polish-for-koreans', kind: 'season', hobbyId: 'polish-for-koreans', name: { pl: 'Rozmowy po polsku', ko: '폴란드어 대화' }, levels: ['A2', 'B1', 'B2'], level: { pl: 'A2–B2', ko: 'A2–B2' }, seats: 6, members: [0, 2, 1, 5], host: 0, week: 3, warmth: 61,
      prompts: { show: { pl: 'Napisz jedno polskie słowo, które lubisz najbardziej.', ko: '제일 좋아하는 폴란드어 단어를 하나 써 보세요.' }, choose: { pl: 'Polski czy koreański: który język jest trudniejszy?', ko: '폴란드어와 한국어 중 어느 쪽이 더 어려워요?' }, mission: { pl: 'Napisz trzy zdania o swoim ostatnim weekendzie.', ko: '지난 주말에 대해 세 문장으로 써 보세요.' }, ask: { pl: 'Zapytaj stolik, jak powiedzieć coś po polsku.', ko: '폴란드어로 어떻게 말하는지 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: przedstaw się po polsku.', ko: '15초 녹음: 폴란드어로 자기소개를 해 보세요.' } } },
    { id: 'sezon-kpop-dance', kind: 'season', hobbyId: 'kpop-dance', name: { pl: 'K-pop taniec', ko: '케이팝 댄스' }, levels: ['A1', 'A2', 'B1', 'B2'], level: { pl: 'A1–B2', ko: 'A1–B2' }, seats: 6, members: [5, 0, 2, 1], host: 5, week: 1, warmth: 66,
      prompts: { show: { pl: 'Pokaż choreografię K-pop, którą chcesz się nauczyć, i napisz dlaczego.', ko: '배우고 싶은 케이팝 안무를 보여 주고 이유를 써 보세요.' }, choose: { pl: 'Dance practice czy występ na scenie: co wolisz oglądać?', ko: '안무 연습 영상과 무대 영상 중에 뭐가 더 좋아요?' }, mission: { pl: 'Zapisz po koreańsku trzy słowa z lekcji tańca, np. „raz, dwa, trzy”.', ko: '댄스 수업에서 쓰는 말을 세 개 써 보세요.' }, ask: { pl: 'Zapytaj stolik, jaka piosenka jest najtrudniejsza do wytańczenia.', ko: '추기 제일 어려운 노래가 뭔지 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: opisz swój ulubiony układ taneczny.', ko: '15초 녹음: 제일 좋아하는 안무를 소개해 보세요.' } } },
    { id: 'sezon-cooking-club', kind: 'season', hobbyId: 'cooking-club', name: { pl: 'Klub gotowania', ko: '요리 클럽' }, levels: ['A1', 'A2', 'B1', 'B2'], level: { pl: 'A1–B2', ko: 'A1–B2' }, seats: 6, members: [3, 0, 2, 5], host: 3, week: 2, warmth: 64,
      prompts: { show: { pl: 'Pokaż, co dziś jadłeś(-aś), i napisz, jak to się nazywa.', ko: '오늘 먹은 음식을 보여 주고 이름을 써 보세요.' }, choose: { pl: 'Ostre czy łagodne? Dlaczego?', ko: '매운 음식과 순한 음식 중에 뭐가 좋아요? 왜요?' }, mission: { pl: 'Zapisz trzy składniki, które masz dziś w lodówce.', ko: '오늘 냉장고에 있는 재료 세 가지를 써 보세요.' }, ask: { pl: 'Zapytaj stolik o ulubiony przepis.', ko: '좋아하는 요리법을 테이블에 물어보세요.' }, voice: { pl: 'Nagraj 15 sekund: Twoje ulubione danie.', ko: '15초 녹음: 제일 좋아하는 음식을 소개해 보세요.' } } }
  );
  (function () {
    var CLUBS = ['fandoms', 'book-club', 'kdrama-club', 'kpop-dance', 'cooking-club'];
    D.tables.forEach(function (x) {
      if (x.kind !== 'season' || /^level-/.test(x.hobbyId)) return;
      if (x.hobbyId === 'polish-for-koreans') { x.kind = 'club'; delete x.week; delete x.min; x.live = true; delete x.free; return; }
      if (CLUBS.indexOf(x.hobbyId) >= 0) { x.kind = 'club'; delete x.week; delete x.min; if (['kdrama-club', 'kpop-dance', 'polish-for-koreans'].indexOf(x.hobbyId) >= 0) x.live = true; if (x.hobbyId === 'polish-for-koreans') x.free = true; } else { x.min = 4; }
    });
  })();
  function byId(id) { for (var i = 0; i < D.tables.length; i++) if (D.tables[i].id === id) return D.tables[i]; }
  [['beginner', 'Stolik Beginner', '초급 테이블', [1, 2, 3, 0], 1, 2, 62], ['intermediate', 'Stolik Intermediate', '중급 테이블', [3, 4, 5, 2], 3, 3, 68], ['advanced', 'Stolik Advanced', '고급 테이블', [1, 4, 0], 4, 1, 54]].forEach(function (r) {
    D.tables.splice(D.tables.indexOf(byId('probny-' + r[0])) + 1, 0, {
      id: 'sezon-' + r[0], kind: 'season', track: r[0], hobbyId: 'level-' + r[0], name: { pl: r[1], ko: r[2] },
      levels: TRACK[r[0]].levels, level: { pl: TRACK[r[0]].pl, ko: TRACK[r[0]].ko }, seats: 6, members: r[3], host: r[4], week: r[5], warmth: r[6],
      prompts: byId('probny-' + r[0]).prompts
    });
  });
  Object.assign(D.seeds, {
    'table:probny-beginner': [
      { author: 'Minji', city: '서울', time: '20:10', lang: 'ko', text: '저는 커피를 좋아해요. 여러분은요?', tr: { pl: 'Lubię kawę. A wy?' } },
      { author: 'Kasia', city: 'Wrocław', time: '12:12', lang: 'ko', text: '저는 차가 더 좋아요.', tr: { pl: 'Wolę herbatę.' } }
    ],
    'table:probny-intermediate': [
      { author: 'Tomek', city: 'Warszawa', time: '12:20', lang: 'ko', text: '저는 저녁형이에요. 밤에 집중이 잘 돼요.', tr: { pl: 'Jestem nocnym markiem. Lepiej skupiam się w nocy.' } },
      { author: 'Jihoon', city: '부산', time: '20:25', lang: 'ko', text: '저는 아침형이에요. 아침에 산책하는 걸 좋아해요.', tr: { pl: 'Jestem rannym ptaszkiem. Lubię spacery o poranku.' } }
    ],
    'table:probny-advanced': [
      { author: 'Seoyeon', city: '서울', time: '20:30', lang: 'ko', text: '언어가 사고방식을 바꾼다고 생각해요. 존댓말이 좋은 예예요.', tr: { pl: 'Myślę, że język zmienia sposób myślenia. Honoryfikatywy są dobrym przykładem.' } }
    ]
  });
  /* roomy 24/7: za darmo tylko Temat dnia, reszta wymaga Premium */
  D.rooms.forEach(function (r) { if (r.always) r.premium = r.id !== 'temat-dnia'; });
  D.channels.push({
    id: 'tips', badge: 'TIPS', lang: 'MIX', topic: 'language', premium: false,
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], level: { pl: 'A1–C2', ko: 'A1–C2' }, ages: ['18-25', '26-35', '36+'],
    name: { pl: 'Study tips & tricks', ko: '공부 꿀팁' },
    desc: { pl: 'metody, aplikacje i triki do nauki', ko: '공부법, 앱, 요령 모음' },
    rule: { pl: 'Dziel się metodami nauki. Pisz po polsku lub koreańsku.', ko: '공부 방법을 나눠 주세요. 폴란드어나 한국어로 써 보세요.' }
  });
  Object.assign(D.seeds, {
    'chat:tips': [
      { author: 'Roma', city: 'Kraków', time: '12:00', lang: 'pl', text: 'Tip na dziś: zapisuj nowe słowa w zdaniu, nie samotnie. Zdanie zapamiętasz łatwiej niż listę.', tr: { ko: '오늘의 팁: 새 단어는 혼자 적지 말고 문장으로 적어 보세요. 목록보다 문장이 더 잘 기억나요.' } },
      { author: 'Minji', city: '서울', time: '20:20', lang: 'ko', text: '저는 드라마 대사를 하나씩 따라 써요. 도움이 많이 돼요!', tr: { pl: 'Przepisuję po jednej kwestii z dramy. Bardzo pomaga!' } }
    ]
  });
  Object.assign(D.seeds, {
    'chat:pl-a1': [
      { author: 'Minji', city: '서울', time: '20:05', lang: 'pl', text: 'Cześć! Mam na imię Minji.', tr: { ko: '안녕하세요! 제 이름은 민지예요.' } },
      { author: 'Ola', city: 'Kraków', time: '12:07', lang: 'pl', text: 'Cześć, Minji! Miło mi.', tr: { ko: '안녕하세요, 민지 씨! 반가워요.' } }
    ],
    'table:probny-kdrama': [
      { author: 'Minji', city: '서울', time: '20:12', lang: 'ko', text: '저는 로맨스가 더 좋아요. 여러분은요?', tr: { pl: 'Wolę romanse. A wy?' } },
      { author: 'Kasia', city: 'Wrocław', time: '12:15', lang: 'ko', text: '저는 스릴러가 더 좋아요. 긴장돼요!', tr: { pl: 'Wolę thrillery. Są pełne napięcia!' } }
    ],
    'table:probny-kuchnia': [
      { author: 'Jihoon', city: '부산', time: '18:20', lang: 'ko', text: '오늘은 김치찌개를 만들었어요.', tr: { pl: 'Dziś zrobiłem kimchi-jjigae.' } },
      { author: 'Ania', city: 'Kraków', time: '10:24', lang: 'pl', text: 'Wygląda pysznie! Czy jest ostre?', tr: { ko: '맛있어 보여요! 매워요?' } }
    ],
    'table:sezon-kpop': [
      { author: 'Seoyeon', city: '서울', time: '19:40', lang: 'ko', text: '이번 주말에 같이 춤 영상 볼까요?', tr: { pl: 'Obejrzymy razem w weekend nagranie tańca?' } },
      { author: 'Ania', city: 'Kraków', time: '11:44', lang: 'ko', text: '좋아요! 저는 토요일 오전에 시간 있어요.', tr: { pl: 'Chętnie! W sobotę rano mam czas.' } }
    ],
    'table:sezon-podroze': [
      { author: 'Jihoon', city: '부산', time: '17:55', lang: 'ko', text: '부산에 오면 해운대에 꼭 가 보세요.', tr: { pl: 'Jeśli przyjedziesz do Busan, koniecznie odwiedź Haeundae.' } }
    ]
  });
  (function () { var sd = D.seeds; sd['table:sezon-kpop-dance'] = sd['table:sezon-kpop']; })();
  (function () {
    var m = byId('sezon-beginner'), p = byId('probny-beginner');
    if (m) {
      m.name = { pl: 'Stolik Beginner z nauczycielem', ko: '선생님과 함께하는 초급 테이블' };
      m.seats = 5; m.members = [1, 2, 3]; m.mentor = true; m.price = 29; m.week = 1; m.lang = 'KR';
      D.seeds['table:sezon-beginner'] = D.seeds['table:probny-beginner'];
    }
    D.tables = D.tables.filter(function (x) { return x.kind !== 'trial'; });
    var im = byId('sezon-intermediate'); if (im) im.paid = true;
    ['probny-advanced', 'sezon-advanced'].forEach(function (id) { var a = byId(id); if (a) a.soon = true; });
  })();
})();
