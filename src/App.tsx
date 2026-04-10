import { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Navigation, 
  Search, 
  Filter, 
  ChevronRight, 
  Utensils, 
  Coffee,
  Map as MapIcon,
  Edit2,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { restaurants as initialRestaurants, Restaurant } from './data/restaurants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker for current location
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Estimate walking time (approx 5km/h)
function estimateTime(distanceKm: number) {
  const minutes = (distanceKm / 5) * 60;
  if (minutes < 1) return '1분 미만';
  if (minutes > 60) return `${Math.floor(minutes / 60)}시간 ${Math.round(minutes % 60)}분`;
  return `${Math.round(minutes)}분`;
}

// Component to update map view
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [currentLocation, setCurrentLocation] = useState({
    address: '경기도 성남시 분당구 판교로256번길 7',
    lat: 37.402,
    lng: 127.103
  });
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempAddress, setTempAddress] = useState(currentLocation.address);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local storage for user restaurants
  const [userRestaurants, setUserRestaurants] = useState<Restaurant[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '한식' as Restaurant['category'],
    description: '',
    rating: 4.5,
    url: '',
    address: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('user_restaurants');
    if (saved) {
      setUserRestaurants(JSON.parse(saved));
    }
  }, []);

  const saveToLocal = (updated: Restaurant[]) => {
    setUserRestaurants(updated);
    localStorage.setItem('user_restaurants', JSON.stringify(updated));
  };

  const allRestaurants = useMemo(() => {
    return [...initialRestaurants, ...userRestaurants];
  }, [userRestaurants]);

  const filteredRestaurants = useMemo(() => {
    return allRestaurants
      .filter(r => {
        const matchesCategory = selectedCategory === '전체' || r.category === selectedCategory;
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             r.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .map(r => ({
        ...r,
        distance: calculateDistance(currentLocation.lat, currentLocation.lng, r.lat, r.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [selectedCategory, searchQuery, currentLocation, allRestaurants]);

  const handleLocationUpdate = () => {
    setCurrentLocation(prev => ({ ...prev, address: tempAddress }));
    setIsEditingLocation(false);
  };

  const handleAddRestaurant = () => {
    const newRestaurant: Restaurant = {
      id: editingRestaurant?.id || Math.random().toString(36).substr(2, 9),
      ...formData,
      // For demo purposes, we'll assign random coordinates near current location if not provided
      // In a real app, you'd geocode the address or URL
      lat: editingRestaurant?.lat || currentLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: editingRestaurant?.lng || currentLocation.lng + (Math.random() - 0.5) * 0.01,
    };

    if (editingRestaurant) {
      const updated = userRestaurants.map(r => r.id === editingRestaurant.id ? newRestaurant : r);
      saveToLocal(updated);
    } else {
      saveToLocal([...userRestaurants, newRestaurant]);
    }

    setIsAddDialogOpen(false);
    setEditingRestaurant(null);
    setFormData({ name: '', category: '한식', description: '', rating: 4.5, url: '', address: '' });
  };

  const handleDeleteRestaurant = (id: string) => {
    const updated = userRestaurants.filter(r => r.id !== id);
    saveToLocal(updated);
  };

  const openEditDialog = (r: Restaurant) => {
    setEditingRestaurant(r);
    setFormData({
      name: r.name,
      category: r.category,
      description: r.description,
      rating: r.rating,
      url: r.url,
      address: r.address
    });
    setIsAddDialogOpen(true);
  };

  const categories = ['전체', '한식', '중식', '양식', '아시안', '디저트/카페'];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Header & Location */}
      <header className="sticky top-0 z-[1001] bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              판교 맛집 가이드
            </h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-1 border-orange-200 text-orange-600 hover:bg-orange-50">
                  <Plus className="w-4 h-4" />
                  맛집 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingRestaurant ? '맛집 수정' : '새로운 맛집 추가'}</DialogTitle>
                  <DialogDescription>
                    네이버 지도 URL과 정보를 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">네이버 지도 URL</Label>
                    <Input 
                      id="url" 
                      placeholder="https://naver.me/..." 
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">식당 이름</Label>
                    <Input 
                      id="name" 
                      placeholder="식당 이름을 입력하세요" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">카테고리</Label>
                      <select 
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as Restaurant['category']})}
                      >
                        {categories.filter(c => c !== '전체').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rating">평점</Label>
                      <Input 
                        id="rating" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="5"
                        value={formData.rating}
                        onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">한줄 평 / 메모</Label>
                    <Textarea 
                      id="description" 
                      placeholder="맛있어요! 추천합니다." 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>취소</Button>
                  <Button onClick={handleAddRestaurant} className="bg-orange-500 hover:bg-orange-600">
                    {editingRestaurant ? '수정하기' : '추가하기'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2 transition-all duration-200">
            <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
            {isEditingLocation ? (
              <div className="flex-1 flex items-center gap-1">
                <Input 
                  value={tempAddress} 
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="h-7 bg-transparent border-none focus-visible:ring-0 px-0 text-sm"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLocationUpdate}>
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className="text-sm text-neutral-600 truncate">{currentLocation.address}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingLocation(true)}>
                  <Edit2 className="w-3 h-3 text-neutral-400" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20">
        {/* Map Section */}
        <section className="relative h-80 w-full bg-neutral-200 overflow-hidden z-0">
          <MapContainer 
            center={[currentLocation.lat, currentLocation.lng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={[currentLocation.lat, currentLocation.lng]} zoom={15} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
              <Popup>현재 위치</Popup>
            </Marker>
            {filteredRestaurants.map(r => (
              <Marker key={r.id} position={[r.lat, r.lng]}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-sm">{r.name}</p>
                    <p className="text-xs text-neutral-500">{r.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-orange-500 fill-current" />
                      <span className="text-xs font-bold">{r.rating}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          <div className="absolute bottom-4 right-4 z-[400]">
            <Button size="sm" className="rounded-full shadow-lg bg-white text-neutral-900 hover:bg-neutral-100 border border-neutral-200">
              <MapIcon className="w-4 h-4 mr-2" />
              지도 크게보기
            </Button>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="sticky top-[104px] z-40 bg-neutral-50/95 backdrop-blur-sm py-4 px-4">
          <Tabs defaultValue="전체" onValueChange={setSelectedCategory}>
            <TabsList className="bg-transparent h-auto p-0 flex gap-2 overflow-x-auto no-scrollbar justify-start">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm data-[state=active]:bg-neutral-900 data-[state=active]:text-white data-[state=active]:border-neutral-900 transition-all"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </section>

        {/* Restaurant List */}
        <section className="px-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-neutral-500 text-sm">주변 맛집 {filteredRestaurants.length}개</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                <Input 
                  placeholder="검색..." 
                  className="h-7 w-32 pl-7 text-xs rounded-full bg-white border-neutral-200"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredRestaurants.map((r, index) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <div className="w-24 h-24 rounded-xl bg-neutral-100 shrink-0 overflow-hidden relative">
                        <img 
                          src={`https://picsum.photos/seed/${r.id}/200/200`} 
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <Badge className="absolute top-1 left-1 bg-white/90 text-neutral-900 text-[10px] px-1.5 py-0 border-none">
                          {r.category}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold text-lg leading-tight">{r.name}</h3>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-0.5 text-orange-500">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="text-sm font-bold">{r.rating}</span>
                              </div>
                              {userRestaurants.some(ur => ur.id === r.id) && (
                                <div className="flex gap-1 ml-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-neutral-400 hover:text-blue-500"
                                    onClick={(e) => { e.stopPropagation(); openEditDialog(r); }}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-neutral-400 hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(r.id); }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1 line-clamp-1 italic">
                            "{r.description}"
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-neutral-400">
                            <Navigation className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{r.distance.toFixed(1)}km</span>
                          </div>
                          <div className="flex items-center gap-1 text-neutral-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{estimateTime(r.distance)}</span>
                          </div>
                          <a 
                            href={r.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1">
                              상세보기
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRestaurants.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-neutral-300" />
              </div>
              <p className="text-neutral-400">검색 결과가 없습니다.</p>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation (Mobile Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-3 flex justify-between items-center max-w-md mx-auto z-[1001]">
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1 text-orange-500">
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold">맛집찾기</span>
        </Button>
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1 text-neutral-400">
          <Star className="w-5 h-5" />
          <span className="text-[10px] font-medium">즐겨찾기</span>
        </Button>
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1 text-neutral-400">
          <MapIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">지도</span>
        </Button>
        <Button variant="ghost" className="flex flex-col gap-1 h-auto py-1 text-neutral-400">
          <Coffee className="w-5 h-5" />
          <span className="text-[10px] font-medium">카페</span>
        </Button>
      </nav>
    </div>
  );
}
