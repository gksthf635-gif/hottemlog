# -*- coding: utf-8 -*-

import json
from pathlib import Path
stamp='2026-09-01T03:00:00+00:00'
uid=lambda kind,n:f'{kind:08d}-0000-4000-8000-{n:012d}'
categories=[dict(id=uid(1,i+1),name=n,slug=s,sort_order=i,created_at=stamp) for i,(n,s) in enumerate(zip(['생활','주방','식품','뷰티','육아','반려동물','디지털','기타'],['living','kitchen','food','beauty','kids','pets','digital','other']))]
photos=['photo-1558317374-067fb5f30001','photo-1556911220-bff31c812dba','photo-1608571423902-eed4a5ad8108','photo-1602143407151-7111542de6e8','photo-1586023492125-27b2c045efd7','photo-1541643600914-78b084683601','photo-1513519245088-0e12902e5a38','photo-1517849845537-4d257902454a','photo-1583394838336-acd977736f90','photo-1495474472287-4d71bcdd2085','photo-1556229010-6c3f2c9ca5f8','photo-1544776193-352d25ca82cd','photo-1503602642458-232111445657','photo-1588872657578-7efd1f1555ed','photo-1517705008128-361805f42e86']
rows=[('무선 미니 청소기',0,'책상 위 작은 먼지까지, 가볍게 싹','가벼운 무게|틈새 청소|간편한 보관'),('주방 실리콘 정리함',1,'매일 쓰는 주방 도구가 제자리를 찾았어요','물 빠짐 구조|간편 세척|공간 절약'),('촉촉 데일리 핸드크림',3,'손 씻고 나면 꼭 찾게 되는 보습템','산뜻한 사용감|휴대하기 좋은 크기|데일리 보습'),('데일리 보온 텀블러',1,'오늘의 커피도, 내 취향도 담아요','보온·보냉|편안한 그립|데일리 디자인'),('모듈 수납 정리함',0,'정리하고 싶은 마음이 드는 작은 변화','쌓아서 보관|다용도 수납|깔끔한 디자인'),('휴대용 미니 향수 공병',3,'좋아하는 향을 작은 가방에도 쏙','작은 크기|외출 필수품|재사용 가능'),('실리콘 아기 식판',4,'함께 먹는 시간이 조금 더 편해져요','칸 나눔|간편 세척|부드러운 소재'),('반려동물 털 제거 브러시',5,'소파에 남은 털, 이제 조금 더 쉽게','편한 손잡이|반복 사용|다양한 섬유에 활용'),('무선 데일리 헤드폰',6,'혼자만의 시간에 더하고 싶은 아이템','무선 연결|편안한 착용|차분한 색감'),('홈카페 드립백 세트',2,'바쁜 아침에도 나를 위한 한 잔','개별 포장|간편 추출|홈카페'),('실리콘 세안 브러시',3,'하루의 끝, 가볍게 챙기는 나의 루틴','부드러운 돌기|쉬운 건조|컴팩트한 크기'),('패브릭 육아 파우치',4,'가방 속 작은 물건들을 한 번에','넉넉한 수납|가벼운 소재|휴대하기 편리'),('접이식 미니 테이블',7,'작은 공간에도 편안한 자리를 만들어요','접이식 보관|가벼운 무게|다용도 활용'),('무선 충전 패드',6,'책상 위 케이블이 한결 단정해져요','간편 충전|슬림한 디자인|책상 정리'),('무선 미니 가습기',0,'내 책상에 놓는 작은 촉촉함','작은 크기|간단한 조작|손쉬운 관리')]
products=[]
for i,(name,cat,short,points) in enumerate(rows):
 products.append(dict(id=uid(2,i+1),name=name,slug=f'item-{i+1:02}',image_url=f'https://images.unsplash.com/{photos[i]}?auto=format&fit=crop&w=900&q=80',short_description=short,description=f'{name}을 소개하는 샘플 콘텐츠입니다. 사진은 분위기 연출용이며 실제 판매 상품과 다릅니다. 운영 전 실제 상품 사진과 설명으로 교체해 주세요.',recommendation='일상의 작은 불편을 줄여 주는 아이디어가 마음에 들었어요. 내 생활에 잘 맞는지 확인하고 골라보세요.',recommend_points=points.split('|'),affiliate_url='https://www.coupang.com/',category_id=categories[cat]['id'],published=True,featured=i<4,tags=[categories[cat]['name'],'추천템','샘플'],created_at=stamp,updated_at=stamp))
vrows=[('작은 주방, 잘 쓰는 살림템 3가지',1,[2,4,10]),('정리하고 나면 기분까지 좋아져요',4,[1,5,15]),('가방 속, 매일 챙기는 작은 것들',2,[3,6,11]),('나를 위한 조용한 홈카페 시간',9,[4,10,13]),('반려생활이 조금 더 편안해지는 순간',7,[8,5]),('책상 위에 취향을 더하는 방법',8,[9,14,15])]
videos=[];links=[]
for i,(title,p,items) in enumerate(vrows):
 platform='instagram' if i%2==0 else 'youtube'
 videos.append(dict(id=uid(3,i+1),title=title,slug=f'log-{i+1:02}',platform=platform,video_url='https://www.instagram.com/' if platform=='instagram' else 'https://www.youtube.com/',thumbnail_url=products[p]['image_url'],description='한솔이 골라본 일상의 작은 추천템. 이 영상은 화면 확인을 위한 샘플입니다. 운영 전에 원본 영상 링크와 썸네일을 등록해 주세요.',published=True,featured=i<3,sort_order=i,tags=['샘플','살림','일상',products[p]['tags'][0]],published_at=f'2026-09-{9-i:02}T03:00:00+00:00',created_at=stamp,updated_at=stamp))
 for order,item in enumerate(items): links.append(dict(id=uid(4,len(links)+1),video_id=uid(3,i+1),product_id=uid(2,item),sort_order=order))
settings=dict(id=1,site_name='핫템로그',site_description='인스타 릴스와 유튜브 쇼츠에서 소개한 추천템을 한곳에 모았습니다.',instagram_url='https://www.instagram.com/',youtube_url='https://www.youtube.com/',affiliate_disclosure='이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.',footer_text='오늘의 핫템을 기록합니다. © Hottem Log.',default_seo_title='핫템로그 | 영상에서 본 추천템 모음',default_seo_description='인스타 릴스와 유튜브 쇼츠에서 소개한 추천 제품을 한곳에서 확인하세요.',logo_url='',contact_email='')
obj=dict(categories=categories,products=products,videos=videos,links=links,settings=settings,demo=True)
Path('lib/data/seed.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2))
def sql(v):
 if isinstance(v,bool): return 'true' if v else 'false'
 if isinstance(v,int): return str(v)
 if isinstance(v,list): return 'ARRAY['+','.join(sql(x) for x in v)+']::text[]'
 return "'"+str(v).replace("'","''")+"'"
lines=['-- Demonstration content. Replace photos, URLs and copy before launch.','begin;']
for table,records in [('categories',categories),('products',products),('videos',videos),('video_products',links),('settings',[settings])]:
 for r in records: lines.append(f"insert into public.{table} ({', '.join(r)}) values ({', '.join(sql(v) for v in r.values())}) on conflict (id) do nothing;")
lines.append('commit;')
Path('supabase/migrations/202609100002_seed.sql').write_text('\n'.join(lines)+'\n')
