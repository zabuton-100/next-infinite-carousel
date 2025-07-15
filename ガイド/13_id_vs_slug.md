# idとslugの違い

### 🎯 idとは？
- データやリソースを一意に識別するための値（数値やUUIDなど）
- 例: `user.id = 123`, `post.id = 'a1b2c3'`
- 主にデータベースやAPI内部で利用

### 🎯 slugとは？
- URLなどで使われる、人間が読める識別子（英数字・ハイフンなど）
- 例: `post.slug = 'react-carousel-guide'`
- SEOやユーザビリティ向上のために利用

### 📝 使い分けの例

#### 1. idの利用例
```jsx
// APIリクエストやDB操作
fetch(`/api/users/123`);
// 主キーとして利用
const user = users.find(u => u.id === 123);
```

#### 2. slugの利用例
```jsx
// URLに使う
<Link href="/blog/react-carousel-guide">記事へ</Link>
// ルーティング
app/blog/[slug]/page.tsx
```

### 🎯 プロジェクトでの使い分け
- **id**: データの内部管理や更新・削除時の識別に使用
- **slug**: ページURLやSEO、ユーザーが識別しやすいリンクに使用

### 📊 比較表
| 項目 | id | slug |
|------|----|------|
| 一意性 | ◎ | △（重複注意） |
| 可読性 | × | ◎ |
| 変更頻度 | 基本不変 | タイトル変更で変わる場合あり |
| 用途 | DB/API | URL/SEO |

### 🎯 まとめ
- ✅ **id**は内部処理・DB用、**slug**はURLや表示用
- ✅ 両方を適切に使い分けることで、保守性・ユーザビリティ・SEOが向上

idとslugの違いを理解し、適切に使い分けましょう！🚀 