# コンポーネントの解説

### 🧩 コンポーネントとは？
コンポーネントは、UIの一部分を表す関数やクラスです。

```jsx
// 関数コンポーネント（推奨）
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 使用例
<Welcome name="React" />
```

### 📦 プロジェクトの主要コンポーネント

#### 1. `CarouselServer.tsx` - サーバーコンポーネント
```jsx
import InfiniteCarousel from "./InfiniteCarousel";

export default function CarouselServer() {
  return <InfiniteCarousel emojiPairsArray={[]} />;
}
```

**解説：**
- シンプルなラッパーコンポーネント
- `InfiniteCarousel`に空の配列を渡している
- サーバーサイドでレンダリングされる（Next.js App Router）

#### 2. `InfiniteCarousel.tsx` - メインのカルーセルコンポーネント
```jsx
const InfiniteCarousel: React.FC<InfiniteCarouselProps> = ({ 
  emojiPairsArray: initialEmojiPairsArray 
}) => {
  // コンポーネントの実装
}
```

**解説：**
- TypeScriptで型定義された関数コンポーネント
- `React.FC<InfiniteCarouselProps>`: 型安全なコンポーネント
- プロパティ（props）を受け取って処理

### 🎯 コンポーネントの種類

#### 1. **関数コンポーネント（推奨）**
```jsx
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
}
```

#### 2. **アロー関数コンポーネント**
```jsx
const Greeting = ({ name, age }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
};
```

#### 3. **クラスコンポーネント（レガシー）**
```jsx
class Greeting extends React.Component {
  render() {
    const { name, age } = this.props;
    return (
      <div>
        <h1>Hello, {name}!</h1>
        {age && <p>You are {age} years old.</p>}
      </div>
    );
  }
}
```

### 🔧 コンポーネントの実践的な使用

#### 1. **Props（プロパティ）の受け渡し**
```jsx
// 親コンポーネント
function App() {
  return (
    <div>
      <Greeting name="Alice" age={25} />
      <Greeting name="Bob" />
    </div>
  );
}

// 子コンポーネント
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
}
```

#### 2. **条件付きレンダリング**
```jsx
function UserCard({ user, showDetails }) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      {showDetails && (
        <div>
          <p>Email: {user.email}</p>
          <p>Age: {user.age}</p>
        </div>
      )}
    </div>
  );
}
```

#### 3. **リストのレンダリング**
```jsx
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <UserCard user={user} />
        </li>
      ))}
    </ul>
  );
}
```

### 🎯 サーバーコンポーネントとクライアントコンポーネント

#### サーバーコンポーネント（デフォルト）
```jsx
// サーバーサイドで実行される
export default function ServerComponent() {
  // データベースアクセスやAPI呼び出しが可能
  const data = await fetchData();
  
  return (
    <div>
      <h1>Server Component</h1>
      <p>Data: {data}</p>
    </div>
  );
}
```

#### クライアントコンポーネント
```jsx
'use client' // この行が必要

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Client Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### 🔍 コンポーネントの設計原則

#### 1. **単一責任の原則**
```jsx
// 良い例：1つの責任
function UserAvatar({ user }) {
  return <img src={user.avatar} alt={user.name} />;
}

function UserInfo({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// 悪い例：複数の責任
function UserCard({ user }) {
  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => editUser(user.id)}>Edit</button>
      <button onClick={() => deleteUser(user.id)}>Delete</button>
    </div>
  );
}
```

#### 2. **再利用性**
```jsx
// 汎用的なコンポーネント
function Button({ children, onClick, variant = 'primary' }) {
  const baseClass = 'px-4 py-2 rounded';
  const variantClass = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-500 text-white',
    danger: 'bg-red-500 text-white'
  };
  
  return (
    <button 
      className={`${baseClass} ${variantClass[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 使用例
<Button onClick={handleSave}>Save</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
```

### 🎯 まとめ

コンポーネントの利点：
- ✅ **再利用性**: 同じコンポーネントを複数箇所で使用
- ✅ **保守性**: 小さな部品に分割することで管理しやすい
- ✅ **テスト容易性**: 個別のコンポーネントをテスト可能
- ✅ **開発効率**: チーム開発での並行作業が可能

コンポーネントを適切に設計することで、保守性が高く、再利用可能なUIを構築できます！🚀 