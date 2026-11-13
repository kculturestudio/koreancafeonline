/* Scenariusze rozmów z Kotkiem (wg promptu partnera rozmów v2). Koreański do weryfikacji przez native speakera. */
window.KC_ROZMOWY = [
 {
  "id": "cafe",
  "emoji": "☕",
  "level": "A1",
  "name": {
   "pl": "Barista w kawiarni",
   "ko": "카페 바리스타"
  },
  "desc": {
   "pl": "Zamawiasz napój i rozmawiasz z baristą.",
   "ko": "음료를 주문하고 바리스타와 이야기해요."
  },
  "role": "You are a barista in a Korean café. The student is your customer and wants to order a drink.",
  "q": [
   [
    "안녕하세요! 어서 오세요. 오늘 뭐 드릴까요?",
    "Dzień dobry! Witamy. Co dziś podać?",
    "아메리카노 주세요.",
    "Poproszę americano."
   ],
   [
    "보통 어떤 음료를 좋아해요?",
    "Jakie napoje zwykle lubisz?",
    "저는 차를 좋아해요.",
    "Lubię herbatę."
   ],
   [
    "그 음료를 왜 좋아해요?",
    "Dlaczego lubisz ten napój?",
    "맛있어요.",
    "Jest smaczny."
   ],
   [
    "카페에서 보통 뭐 해요?",
    "Co zwykle robisz w kawiarni?",
    "친구를 만나요.",
    "Spotykam się z przyjaciółmi."
   ],
   [
    "누구와 같이 카페에 가요?",
    "Z kim chodzisz do kawiarni?",
    "혼자 가요.",
    "Chodzę sama/sam."
   ],
   [
    "한국 카페에 대해 어떻게 생각해요?",
    "Co myślisz o koreańskich kawiarniach?",
    "예쁘고 조용해요.",
    "Są ładne i spokojne."
   ],
   [
    "집에서 마시는 것과 카페에서 마시는 것 중에 뭐가 더 좋아요?",
    "Wolisz pić w domu czy w kawiarni?",
    "카페가 더 좋아요.",
    "Wolę kawiarnię."
   ],
   [
    "다음에는 카페에서 뭐 하고 싶어요?",
    "Co chcesz zrobić w kawiarni następnym razem?",
    "케이크를 먹고 싶어요.",
    "Chcę zjeść ciasto."
   ]
  ],
  "expr": [
   [
    "주문할게요.",
    "Zamawiam."
   ],
   [
    "포장해 주세요.",
    "Na wynos, poproszę."
   ],
   [
    "여기서 먹을게요.",
    "Zjem na miejscu."
   ]
  ]
 },
 {
  "id": "drama",
  "emoji": "🎬",
  "level": "A2",
  "name": {
   "pl": "Wieczór z dramą",
   "ko": "드라마 보는 저녁"
  },
  "desc": {
   "pl": "Luźna rozmowa o wieczorach, filmach i serialach.",
   "ko": "저녁 시간과 영화, 드라마에 대해 편하게 이야기해요."
  },
  "role": "You are a friendly person chatting about how people spend their evenings and what they watch. Do not assume the student watches dramas.",
  "q": [
   [
    "안녕하세요! 오늘 저녁에 보통 뭐 해요?",
    "Cześć! Co zwykle robisz wieczorami?",
    "보통 집에서 쉬어요.",
    "Zwykle odpoczywam w domu."
   ],
   [
    "쉬는 시간에 어떤 것을 좋아해요? 왜요?",
    "Co lubisz robić w czasie odpoczynku? Dlaczego?",
    "영화를 좋아해요. 재미있어서요.",
    "Lubię filmy, bo są ciekawe."
   ],
   [
    "최근에 본 것 중에 뭐가 기억에 남아요?",
    "Co z ostatnio oglądanych rzeczy zapadło Ci w pamięć?",
    "드라마가 기억에 남아요.",
    "Zapadł mi w pamięć serial."
   ],
   [
    "그것의 어떤 점이 가장 좋았어요?",
    "Co w tym podobało Ci się najbardziej?",
    "이야기가 재미있었어요.",
    "Fabuła była ciekawa."
   ],
   [
    "누구와 같이 봤어요?",
    "Z kim to oglądałeś/aś?",
    "혼자 봤어요.",
    "Oglądałam sama."
   ],
   [
    "영화와 드라마 중에 뭐가 더 좋아요?",
    "Co wolisz: filmy czy seriale?",
    "드라마가 더 좋아요.",
    "Wolę seriale."
   ],
   [
    "보면서 언어를 배우는 것을 어떻게 생각해요?",
    "Co myślisz o nauce języka przez oglądanie?",
    "도움이 된다고 생각해요.",
    "Uważam, że to pomaga."
   ],
   [
    "다음 주말에는 뭐 하고 싶어요?",
    "Co chcesz robić w następny weekend?",
    "영화를 보고 싶어요.",
    "Chcę obejrzeć film."
   ]
  ],
  "expr": [
   [
    "기억에 남아요.",
    "Zapada w pamięć."
   ],
   [
    "재미있게 봤어요.",
    "Oglądałem/am z przyjemnością."
   ],
   [
    "그 점이 마음에 들어요.",
    "Podoba mi się ten aspekt."
   ]
  ]
 },
 {
  "id": "intro",
  "emoji": "👋",
  "level": "A1",
  "name": {
   "pl": "Nowy sąsiad",
   "ko": "새 이웃"
  },
  "desc": {
   "pl": "Przedstawiasz się i opowiadasz o sobie.",
   "ko": "자기소개를 하고 나에 대해 이야기해요."
  },
  "role": "You are a friendly new neighbour in Korea meeting the student for the first time.",
  "q": [
   [
    "안녕하세요! 저는 이웃이에요. 이름이 뭐예요?",
    "Dzień dobry! Jestem sąsiadem. Jak masz na imię?",
    "저는 안나예요.",
    "Mam na imię Anna."
   ],
   [
    "만나서 반가워요. 어디에서 왔어요?",
    "Miło poznać. Skąd jesteś?",
    "폴란드에서 왔어요.",
    "Jestem z Polski."
   ],
   [
    "거기는 어떤 곳이에요?",
    "Jakie to miejsce?",
    "큰 도시예요.",
    "To duże miasto."
   ],
   [
    "무슨 일을 해요?",
    "Czym się zajmujesz?",
    "학생이에요.",
    "Jestem studentem/ką."
   ],
   [
    "시간이 있을 때 뭐 해요?",
    "Co robisz w wolnym czasie?",
    "음악을 들어요.",
    "Słucham muzyki."
   ],
   [
    "한국어는 왜 배워요?",
    "Dlaczego uczysz się koreańskiego?",
    "한국이 좋아서요.",
    "Bo lubię Koreę."
   ],
   [
    "한국어 공부는 어때요?",
    "Jak Ci idzie nauka koreańskiego?",
    "조금 어렵지만 재미있어요.",
    "Trochę trudno, ale ciekawie."
   ],
   [
    "다음에는 뭐 하고 싶어요?",
    "Co chcesz zrobić następnym razem?",
    "같이 커피를 마시고 싶어요.",
    "Chcę wypić razem kawę."
   ]
  ],
  "expr": [
   [
    "만나서 반가워요.",
    "Miło mi."
   ],
   [
    "어디에서 왔어요?",
    "Skąd jesteś?"
   ],
   [
    "잘 부탁드립니다.",
    "Proszę o życzliwość (przy poznaniu)."
   ]
  ]
 },
 {
  "id": "weekend",
  "emoji": "🌤️",
  "level": "A2",
  "name": {
   "pl": "Weekend z przyjaciółką",
   "ko": "친구와 주말"
  },
  "desc": {
   "pl": "Opowiadasz o weekendzie i planach.",
   "ko": "주말과 계획에 대해 이야기해요."
  },
  "role": "You are a Korean friend asking the student about their weekend and plans.",
  "q": [
   [
    "안녕하세요! 이번 주말에 뭐 했어요?",
    "Cześć! Co robiłeś/aś w ten weekend?",
    "친구를 만났어요.",
    "Spotkałam się z przyjaciółką."
   ],
   [
    "그때 어땠어요?",
    "Jak było?",
    "재미있었어요.",
    "Było fajnie."
   ],
   [
    "누구와 같이 했어요?",
    "Z kim to robiłeś/aś?",
    "가족과 같이 했어요.",
    "Z rodziną."
   ],
   [
    "조금 더 설명해 주세요.",
    "Powiedz trochę więcej.",
    "공원에서 산책했어요.",
    "Spacerowałam po parku."
   ],
   [
    "주말에 보통 뭐 하는 것을 좋아해요? 왜요?",
    "Co lubisz robić w weekendy? Dlaczego?",
    "집에서 쉬는 것을 좋아해요. 피곤해서요.",
    "Lubię odpoczywać w domu, bo jestem zmęczona."
   ],
   [
    "주말과 평일 중에 뭐가 더 좋아요?",
    "Weekend czy dni robocze – co wolisz?",
    "주말이 더 좋아요.",
    "Wolę weekend."
   ],
   [
    "다음 주말에는 뭐 하고 싶어요?",
    "Co chcesz robić w następny weekend?",
    "여행을 가고 싶어요.",
    "Chcę pojechać na wycieczkę."
   ],
   [
    "주말을 더 재미있게 보내려면 뭐가 필요해요?",
    "Czego potrzeba, by weekend był jeszcze fajniejszy?",
    "시간이 더 있으면 좋아요.",
    "Dobrze byłoby mieć więcej czasu."
   ]
  ],
  "expr": [
   [
    "주말에 뭐 했어요?",
    "Co robiłeś w weekend?"
   ],
   [
    "시간이 있으면…",
    "Jeśli mam czas…"
   ],
   [
    "같이 가고 싶어요.",
    "Chcę iść razem."
   ]
  ]
 },
 {
  "id": "resto",
  "emoji": "🍜",
  "level": "A1",
  "name": {
   "pl": "W restauracji",
   "ko": "식당에서"
  },
  "desc": {
   "pl": "Zamawiasz jedzenie i rozmawiasz o smakach.",
   "ko": "음식을 주문하고 맛에 대해 이야기해요."
  },
  "role": "You are a waiter/waitress in a Korean restaurant. The student is a guest.",
  "q": [
   [
    "어서 오세요! 몇 분이세요?",
    "Witamy! Ilu osób?",
    "두 명이에요.",
    "Dwie osoby."
   ],
   [
    "뭐 드시고 싶어요?",
    "Co chcesz zjeść?",
    "비빔밥을 먹고 싶어요.",
    "Chcę zjeść bibimbap."
   ],
   [
    "왜 그것을 골랐어요?",
    "Dlaczego to wybrałeś/aś?",
    "맛있을 것 같아요.",
    "Chyba będzie smaczne."
   ],
   [
    "보통 어떤 음식을 좋아해요?",
    "Jakie jedzenie zwykle lubisz?",
    "매운 음식을 좋아해요.",
    "Lubię ostre jedzenie."
   ],
   [
    "음식을 고를 때 뭐가 중요해요?",
    "Co jest ważne przy wyborze jedzenia?",
    "맛이 중요해요.",
    "Ważny jest smak."
   ],
   [
    "보통 누구와 같이 먹어요?",
    "Z kim zwykle jadasz?",
    "가족과 같이 먹어요.",
    "Z rodziną."
   ],
   [
    "집에서 먹는 것과 식당에서 먹는 것 중에 뭐가 더 좋아요?",
    "Wolisz jeść w domu czy w restauracji?",
    "식당이 더 좋아요.",
    "Wolę restaurację."
   ],
   [
    "다음에는 어떤 음식을 먹어 보고 싶어요?",
    "Jakie jedzenie chcesz następnym razem spróbować?",
    "김치찌개를 먹어 보고 싶어요.",
    "Chcę spróbować kimchi-jjigae."
   ]
  ],
  "expr": [
   [
    "메뉴판 주세요.",
    "Poproszę menu."
   ],
   [
    "맵지 않게 해 주세요.",
    "Proszę nieostre."
   ],
   [
    "계산해 주세요.",
    "Rachunek poproszę."
   ]
  ]
 }
];
