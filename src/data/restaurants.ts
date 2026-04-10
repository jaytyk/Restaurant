export interface Restaurant {
  id: string;
  name: string;
  category: '한식' | '중식' | '양식' | '아시안' | '디저트/카페';
  description: string;
  rating: number;
  url: string;
  lat: number;
  lng: number;
  address: string;
}

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: '타이팔칠',
    category: '아시안',
    description: '맛보장, 지난주도 다녀와씀',
    rating: 4.5,
    url: 'https://naver.me/G4Wo5rQc',
    lat: 37.401,
    lng: 127.105,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '2',
    name: '우나기강',
    category: '아시안',
    description: '히츠마부시(장어덮밥) - 몸보신 필요할때?',
    rating: 4.6,
    url: 'https://naver.me/FxFKfcwn',
    lat: 37.403,
    lng: 127.108,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '3',
    name: '비즐돈까스',
    category: '양식',
    description: '제목부터 시강인 돈가스집',
    rating: 4.4,
    url: 'https://naver.me/FLyTqtZ0',
    lat: 37.400,
    lng: 127.102,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '4',
    name: '토속상황삼계탕',
    category: '한식',
    description: '복날 가려고 아껴뒀습니다.',
    rating: 4.7,
    url: 'https://naver.me/x4FLQkBf',
    lat: 37.405,
    lng: 127.104,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '5',
    name: '아시안퀴진 똠 판교점',
    category: '아시안',
    description: '가깝고! 죠탸',
    rating: 4.3,
    url: 'https://naver.me/5oE5LiPM',
    lat: 37.402,
    lng: 127.104,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '6',
    name: '왕스덕 판교점',
    category: '중식',
    description: '가성비 좋은 베이징덕',
    rating: 4.5,
    url: 'https://naver.me/xxY283hc',
    lat: 37.403,
    lng: 127.105,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '7',
    name: '반포식스',
    category: '아시안',
    description: '가볍게 쌀국수',
    rating: 4.2,
    url: 'https://naver.me/Fuz51xmU',
    lat: 37.401,
    lng: 127.106,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '8',
    name: '한식집 무안회관',
    category: '한식',
    description: '낙지덮밥, 낙지칼국수 뭐든있음',
    rating: 4.4,
    url: 'https://naver.me/5MVz8Pm2',
    lat: 37.404,
    lng: 127.102,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '9',
    name: '샤브촌by계백집 판교점',
    category: '한식',
    description: '뜨끈하고 건강하게 샤브샤브',
    rating: 4.3,
    url: 'https://naver.me/FXwGVSxi',
    lat: 37.402,
    lng: 127.105,
    address: '경기도 성남시 분당구 판교로'
  },
  {
    id: '10',
    name: '덕후선생 아브뉴프랑 판교점',
    category: '중식',
    description: '베이징덕 진짜 맛이씀!!',
    rating: 4.6,
    url: 'https://naver.me/GyYbPTJ6',
    lat: 37.394,
    lng: 127.111,
    address: '경기도 성남시 분당구 동판교로'
  },
  {
    id: '11',
    name: '조가네갑오징어 백운호수점',
    category: '한식',
    description: '통통한 갑오징어를 먹고 싶다면 아묻따. 걍 고',
    rating: 4.5,
    url: 'https://naver.me/Gq84vnBQ',
    lat: 37.355,
    lng: 127.012,
    address: '경기도 의왕시 학의동'
  },
  {
    id: '12',
    name: '백세짬뽕 수원본점',
    category: '중식',
    description: '여기 차돌짬뽕!! 삼계죽 강.력.추.천.',
    rating: 4.4,
    url: 'https://naver.me/xWTn6oHm',
    lat: 37.305,
    lng: 127.005,
    address: '경기도 수원시 장안구'
  }
];
