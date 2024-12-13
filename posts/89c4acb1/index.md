# 从 C 过渡到 C&#43;&#43;


## 前言

由于 C 语言缺乏对 Map、Set 等数据结构的支持，在写算法题时，经常需要自己实现这些数据结构或者借助第三方库，例如 [uthash](https://troydhanson.github.io/uthash/userguide.html) 等。

但是很难保证，线上笔试的编译环境是否支持这些第三方库，因此为了秋招以及重温对 C&#43;&#43; 的理解，最近在重新梳理 C&#43;&#43; 的知识。

## 字符串以及文件操作

### 字符串

C&#43;&#43; 支持字符串类型，即 `string`，而 C 语言中没有字符串类型，只能使用字符数组来表示字符串。
C&#43;&#43; 中的字符串类型为 `string`，其定义在 `string` 头文件中。

```cpp
#include &lt;iostream&gt;
#include &lt;string&gt;

using namespace std;

int main() {
    string s = &#34;Hello World&#34;;
    cout &lt;&lt; s &lt;&lt; endl;
    return 0;
}
```

针对 `string` 类型的变量，可以继续用 `[]` 进行索引，也可以使用 `size()` 函数获取字符串的长度。

```cpp
#include &lt;iostream&gt;
#include &lt;string&gt;

using namespace std;

int main() {
    string s = &#34;Hello World&#34;;
    for (int i = 0; i &lt; s.size(); i&#43;&#43;) {
        cout &lt;&lt; s[i];
    }
    cout &lt;&lt; endl;
    return 0;
}
```

C&#43;&#43; 中的字符串类型和字符数组之间可以相互转换，只需使用 `c_str()` 函数以及 `string` 构造函数进行转换即可。

```cpp
#include &lt;iostream&gt;
#include &lt;string&gt;

using namespace std;

int main() {
    string s = &#34;Hello World&#34;;
    char c[100];
    strcpy(c, s.c_str());
    printf(&#34;%s\n&#34;, c);

    string s2(c);
    cout &lt;&lt; s2 &lt;&lt; endl;
    return 0;
}
```

### 标准输入输出

`cin` 和 `cout` 是 C&#43;&#43; 的标准输入输出流，分别对应于 C 语言中的 `scanf` 和 `printf`。

```cpp
#include &lt;iostream&gt;

using namespace std;

int main() {
    int a, b;
    cin &gt;&gt; a &gt;&gt; b;
    cout &lt;&lt; a &#43; b &lt;&lt; endl;
    return 0;
}
```

然而 `cout` 的格式化输出较为麻烦，例如输出一个浮点数，需要指定精度、小数点后保留的位数等。

```cpp
#include &lt;iostream&gt;
// iomanip 头文件中定义了一些用于格式化输出的函数
#include &lt;iomanip&gt;

using namespace std;

int main() {
    double a = 1.0 / 3.0;
    cout &lt;&lt; fixed &lt;&lt; setprecision(3) &lt;&lt; a &lt;&lt; endl;
    return 0;
}
```

此时我会继续使用 `printf`。

### 文件输入输出

C&#43;&#43; 中的文件输入输出流分别为 `ifstream` 和 `ofstream`，分别对应于 C 语言中的 `fopen` 和 `fprintf`。

```cpp
#include &lt;iostream&gt;
#include &lt;fstream&gt;

using namespace std;

int main() {
    ifstream fin(&#34;input.txt&#34;);
    ofstream fout(&#34;output.txt&#34;);
    int a, b;
    fin &gt;&gt; a &gt;&gt; b;
    fout &lt;&lt; a &#43; b &lt;&lt; endl;
    return 0;
}
```

### 其他常用函数

#### `getline` 和 `eof`

`getline` 函数用于读取一行字符串，其第一个参数为输入流，第二个参数为字符串变量。
获取的字符串不包含换行符。

`eof` 函数用于判断输入流是否已经读取到文件末尾。

```cpp
#include &lt;iostream&gt;
#include &lt;fstream&gt;
#include &lt;string&gt;

using namespace std;

int main() {
    ifstream fin(&#34;input.txt&#34;);
    string a;
    while (!fin.eof()) {
        getline(fin, a);
        cout &lt;&lt; a &lt;&lt; endl;
    }
    return 0;
}
```

#### `stoi`、`stol`、`stoll`、`stof`、`stod`、`stold`

`stoi`、`stol`、`stoll`、`stof`、`stod`、`stold` 函数用于将字符串转换为整数、长整数、长长整数、浮点数、双精度浮点数、长双精度浮点数。
他们的用法类似，只是返回值类型不同。

```cpp
#include &lt;iostream&gt;
#include &lt;string&gt;

using namespace std;

int main() {
    string a = &#34;123&#34;;
    int b = stoi(a);
    cout &lt;&lt; b &lt;&lt; endl;

    string c = &#34;123.456&#34;;
    float d = stof(c);
    cout &lt;&lt; d &lt;&lt; endl;
}
```

## STL

STL 即标准模板库是 C&#43;&#43; 中的一个重要组成部分，包含了很多常用的数据结构和算法，例如 `vector`、`map`、`set`、`sort` 等。

### 容器与容器适配器

C&#43;&#43; 的 STL 包含基础的容器和容器适配器，容器适配器是基础容器的封装，提供了一些特殊的功能。

- 序列式容器：`vector`、`deque`、`forward_list`、`list`、`array`
- 关联式容器：`set`、`map`、`unordered_set`、`unordered_map`
- 容器适配器：`stack`、`queue`、`priority_queue`

### 向量 `vector`

`vector` 容器类似于 C 语言中的数组，但是 `vector` 的长度可以动态变化，其常用的成员函数有：

- `push_back(xxx)`：在数组末尾添加一个元素
- `pop_back()`：删除数组末尾的一个元素
- `emplace_back(xxx)`：在数组末尾添加一个元素，与 `push_back` 的区别是，`emplace_back` 效率更高
- `insert(pos, xxx)`：在数组的 `pos` 位置插入一个元素
- `emplace(pos, xxx)`：在数组的 `pos` 位置插入一个元素，与 `insert` 的区别是，`emplace` 效率更高
- `empty()`：判断数组是否为空
- `size()`：获取数组的长度
- `clear()`：清空数组
- `begin()`：获取数组的首地址，常用于遍历数组
- `end()`：获取数组的末尾地址，常用于遍历数组
- `front()`：获取数组的首元素
- `back()`：获取数组的末尾元素

```cpp
#include &lt;iostream&gt;
#include &lt;vector&gt;

using namespace std;

int main() {
    vector&lt;int&gt; v;
    v.push_back(1);
    v.push_back(2);
    v.emplace_back(3);
    v.emplace_back(4);
    for (int i = 0; i &lt; v.size(); i&#43;&#43;) {
        cout &lt;&lt; v[i] &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 1 2 3 4

    v.pop_back();
    v.pop_back();
    vector&lt;int&gt;::iterator it;
    for (it = v.begin(); it != v.end(); it&#43;&#43;) {
        cout &lt;&lt; *it &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 1 2

    v.insert(v.begin(), 3);
    v.insert(v.begin() &#43; 1, 4);
    for (int i = 0; i &lt; v.size(); i&#43;&#43;) {
        cout &lt;&lt; v[i] &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 3 4 1 2

    v.clear();
    cout &lt;&lt; v.empty() &lt;&lt; endl;
    // 1
    return 0;
}
```

### 快速排序

C&#43;&#43; 中的快速排序函数为 `sort`，包含在 `algorithm` 头文件中，其第一个参数为数组的首地址，第二个参数为数组的末尾地址，第三个参数为比较函数。

```cpp
#include &lt;iostream&gt;
#include &lt;algorithm&gt;
#include &lt;vector&gt;

using namespace std;

bool myfunction (int i, int j) {
    return i &gt; j;
}

int main () {
    vector&lt;int&gt; myvector = {32,71,12,45,26,80,53,33};

    // 默认升序(操作符 &lt;)
    sort(myvector.begin(), myvector.begin() &#43; 4);
    // (12 32 45 71) 26 80 53 33

    // 自定义比较函数
    sort(myvector.begin() &#43; 4, myvector.end(), myfunction);
    // 12 32 45 71 (80 53 33 26)

    for (int i = 0; i &lt; myvector.size(); i&#43;&#43;) {
        cout &lt;&lt; myvector[i] &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;

    return 0;
}
```

### 双端队列 `deque`

`deque` 容器就是双端队列，可以在队列的首部和末尾添加元素以及删除元素，其常用的成员函数有：

- `push_back(xxx)`：在队列末尾添加一个元素
- `pop_back()`：删除队列末尾的一个元素
- `emplace_back(xxx)`：在队列末尾添加一个元素，与 `push_back` 的区别是，`emplace_back` 效率更高
- `push_front(xxx)`：在队列首部添加一个元素
- `pop_front()`：删除队列首部的一个元素
- `emplace_front(xxx)`：在队列首部添加一个元素，与 `push_front` 的区别是，`emplace_front` 效率更高
- `empty()`：判断队列是否为空
- `size()`：获取队列的长度
- `clear()`：清空队列
- `begin()`：获取队列的首地址，常用于遍历队列
- `end()`：获取队列的末尾地址，常用于遍历队列
- `front()`：获取队列的首元素
- `back()`：获取队列的末尾元素

```cpp
#include &lt;iostream&gt;
#include &lt;deque&gt;

using namespace std;

int main() {
    deque&lt;int&gt; d;
    d.push_back(1);
    d.push_back(2);
    d.emplace_back(3);
    d.emplace_back(4);
    for (int i = 0; i &lt; d.size(); i&#43;&#43;) {
        cout &lt;&lt; d[i] &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 1 2 3 4

    d.pop_back();
    d.pop_back();
    deque&lt;int&gt;::iterator it;
    for (it = d.begin(); it != d.end(); it&#43;&#43;) {
        cout &lt;&lt; *it &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 1 2

    d.push_front(3);
    d.push_front(4);
    for (int i = 0; i &lt; d.size(); i&#43;&#43;) {
        cout &lt;&lt; d[i] &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 4 3 1 2

    d.clear();
    cout &lt;&lt; d.empty() &lt;&lt; endl;
    // 1
    return 0;
}
```

### 队列 `queue`

`queue` 容器就是队列，只能在队列的末尾添加元素，在队列的首部删除元素，其常用的成员函数有：

- `push(xxx)`：在队列末尾添加一个元素
- `pop()`：删除队列首部的一个元素
- `emplace(xxx)`：在队列末尾添加一个元素，与 `push` 的区别是，`emplace` 效率更高
- `empty()`：判断队列是否为空
- `size()`：获取队列的长度
- `front()`：获取队列的首元素
- `back()`：获取队列的末尾元素

```cpp
#include &lt;iostream&gt;
#include &lt;queue&gt;

using namespace std;

int main() {
    queue&lt;int&gt; q;
    q.push(1);
    q.push(2);
    q.emplace(3);
    q.emplace(4);
    cout &lt;&lt; q.front() &lt;&lt; endl;
    // 1
    cout &lt;&lt; q.back() &lt;&lt; endl;
    // 4
    q.pop();
    cout &lt;&lt; q.front() &lt;&lt; endl;
    // 2
    cout &lt;&lt; q.back() &lt;&lt; endl;
    // 4
    return 0;
}
```

### 栈 `stack`

`stack` 容器 就是栈，只能在栈的末尾添加元素，在栈的末尾删除元素，其常用的成员函数有：

- `push(xxx)`：在栈末尾添加一个元素
- `pop()`：删除栈末尾的一个元素
- `emplace(xxx)`：在栈末尾添加一个元素，与 `push` 的区别是，`emplace` 效率更高
- `empty()`：判断栈是否为空
- `size()`：获取栈的长度
- `top()`：获取栈顶元素

```cpp
#include &lt;iostream&gt;
#include &lt;stack&gt;

using namespace std;

int main() {
    stack&lt;int&gt; s;
    s.push(1);
    s.push(2);
    s.emplace(3);
    s.emplace(4);
    cout &lt;&lt; s.top() &lt;&lt; endl;
    // 4
    s.pop();
    cout &lt;&lt; s.top() &lt;&lt; endl;
    // 3
    return 0;
}
```

### 优先级队列 `priority_queue`

`priority_queue` 容器就是优先级队列，其底层实现为堆，其常用的成员函数有：

- `push(xxx)`：在队列末尾添加一个元素
- `pop()`：删除队列首部的一个元素
- `emplace(xxx)`：在队列末尾添加一个元素，与 `push` 的区别是，`emplace` 效率更高
- `empty()`：判断队列是否为空
- `size()`：获取队列的长度
- `top()`：获取队列的首元素

#### 大顶堆、小顶堆

- 默认情况下，`priority_queue` 容器使用的比较函数为 `less`，即从大到小的顺序排列,被称为大顶堆、大根堆;
- 如果想要实现从小到大的顺序排列，也就是小顶堆、小根堆，需要使用 `greater` 比较函数。

```cpp
#include &lt;iostream&gt;
#include &lt;queue&gt;

using namespace std;

int main() {
    // 默认大顶堆
    priority_queue&lt;int&gt; q;
    q.push(1);
    q.push(2);
    q.emplace(3);
    q.emplace(4);
    cout &lt;&lt; q.top() &lt;&lt; endl;
    // 4
    q.pop();
    cout &lt;&lt; q.top() &lt;&lt; endl;
    // 3

    // 小顶堆
    priority_queue&lt;int, vector&lt;int&gt;, greater&lt;int&gt;&gt; q2;
    q2.push(1);
    q2.push(2);
    q2.emplace(3);
    q2.emplace(4);
    cout &lt;&lt; q2.top() &lt;&lt; endl;
    // 1
    q2.pop();
    cout &lt;&lt; q2.top() &lt;&lt; endl;
    // 2
    return 0;
}
```

### 集合 `set`

`set` 容器就是集合，其底层实现为红黑树，其常用的成员函数有：

- `insert(xxx)`：在集合中插入一个元素
- `emplace(xxx)`：在集合中插入一个元素，与 `insert` 的区别是，`emplace` 效率更高
- `erase(xxx)`：删除集合中的一个元素
- `empty()`：判断集合是否为空
- `size()`：获取集合的长度
- `clear()`：清空集合
- `begin()`：获取集合的首地址，常用于遍历集合
- `end()`：获取集合的末尾地址，常用于遍历集合
- `count(xxx)`：查找集合中是否存在某个元素，如果存在则返回 1，否则返回 0
- `find(xxx)`：查找集合中是否存在某个元素，如果存在则返回该元素的迭代器，否则返回 `end()` 迭代器

```cpp
#include &lt;iostream&gt;
#include &lt;set&gt;

using namespace std;

int main() {
    set&lt;int&gt; s;
    s.insert(1);
    s.insert(2);
    s.emplace(3);
    s.emplace(4);
    set&lt;int&gt;::iterator it;
    for (it = s.begin(); it != s.end(); it&#43;&#43;) {
        cout &lt;&lt; *it &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 1 2 3 4

    s.erase(1);
    s.erase(2);
    for (it = s.begin(); it != s.end(); it&#43;&#43;) {
        cout &lt;&lt; *it &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 3 4

    cout &lt;&lt; s.count(3) &lt;&lt; endl;
    // 1
    cout &lt;&lt; s.count(5) &lt;&lt; endl;
    // 0

    if (s.find(3) != s.end()) {
        cout &lt;&lt; &#34;find 3&#34; &lt;&lt; endl;
    }
    if (s.find(5) == s.end()) {
        cout &lt;&lt; &#34;not find 5&#34; &lt;&lt; endl;
    }
    return 0;
}
```

### 映射 `map`

`map` 容器就是映射，其底层实现也为红黑树，其常用的成员函数有：

- `[]`：获取映射中某个元素的值，如果不存在则会创建该元素并赋值为 0
- `at(k)`：获取映射中某个元素的值，如果不存在则会抛出异常
- `insert(pair&lt;k, v&gt;)`：在映射中插入一个元素
- `emplace(k, v)`：在映射中插入一个元素，与 `insert` 的区别是，`emplace` 效率更高
- `erase(k)`：删除映射中的一个元素
- `empty()`：判断映射是否为空
- `size()`：获取映射的长度
- `clear()`：清空映射
- `begin()`：获取映射的首地址，常用于遍历映射
- `end()`：获取映射的末尾地址，常用于遍历映射
- `count(k)`：查找映射中是否存在某个元素，如果存在则返回 1，否则返回 0
- `find(k)`：查找映射中是否存在某个元素，如果存在则返回该元素的迭代器，否则返回 `end()` 迭代器

```cpp
#include &lt;iostream&gt;
#include &lt;map&gt;

using namespace std;

int main() {
    map&lt;string, int&gt; m;
    m[&#34;a&#34;] = 1;
    m[&#34;b&#34;] = 2;
    m.emplace(&#34;c&#34;, 3);
    m.emplace(&#34;d&#34;, 4);
    map&lt;string, int&gt;::iterator it;
    for (it = m.begin(); it != m.end(); it&#43;&#43;) {
        cout &lt;&lt; it-&gt;first &lt;&lt; &#34; &#34; &lt;&lt; it-&gt;second &lt;&lt; endl;
    }
    // a 1
    // b 2
    // c 3
    // d 4

    m.erase(&#34;a&#34;);
    m.erase(&#34;b&#34;);
    for (it = m.begin(); it != m.end(); it&#43;&#43;) {
        cout &lt;&lt; it-&gt;first &lt;&lt; &#34; &#34; &lt;&lt; it-&gt;second &lt;&lt; endl;
    }
    // c 3
    // d 4

    cout &lt;&lt; m.count(&#34;c&#34;) &lt;&lt; endl;
    // 1
    cout &lt;&lt; m.count(&#34;e&#34;) &lt;&lt; endl;
    // 0

    if (m.find(&#34;c&#34;) != m.end()) {
        cout &lt;&lt; &#34;find c&#34; &lt;&lt; endl;
    }
    if (m.find(&#34;e&#34;) == m.end()) {
        cout &lt;&lt; &#34;not find e&#34; &lt;&lt; endl;
    }
    return 0;
}
```

### 无序集合 `unordered_set`

`unordered_set` 容器就是无序集合，其底层实现为哈希表，其常用的成员函数和 `set` 容器相同。

```cpp
#include &lt;iostream&gt;
#include &lt;unordered_set&gt;

using namespace std;

int main() {
    unordered_set&lt;int&gt; s;
    s.insert(1);
    s.insert(2);
    s.emplace(3);
    s.emplace(4);
    unordered_set&lt;int&gt;::iterator it;
    for (it = s.begin(); it != s.end(); it&#43;&#43;) {
        cout &lt;&lt; *it &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 4 3 2 1

    s.erase(1);
    s.erase(2);
    for (it = s.begin(); it != s.end(); it&#43;&#43;) {
        cout &lt;&lt; *it &lt;&lt; &#34; &#34;;
    }
    cout &lt;&lt; endl;
    // 4 3

    cout &lt;&lt; s.count(3) &lt;&lt; endl;
    // 1
    cout &lt;&lt; s.count(5) &lt;&lt; endl;
    // 0

    if (s.find(3) != s.end()) {
        cout &lt;&lt; &#34;find 3&#34; &lt;&lt; endl;
    }
    if (s.find(5) == s.end()) {
        cout &lt;&lt; &#34;not find 5&#34; &lt;&lt; endl;
    }
    return 0;
}
```

### 哈希表 `unordered_map`

`unordered_map` 容器就是哈希表，其底层实现为哈希表，其常用的成员函数和 `map` 容器相同。

```cpp
#include &lt;iostream&gt;
#include &lt;unordered_map&gt;

using namespace std;

int main() {
    unordered_map&lt;string, int&gt; m;
    m[&#34;a&#34;] = 1;
    m[&#34;b&#34;] = 2;
    m.emplace(&#34;c&#34;, 3);
    m.emplace(&#34;d&#34;, 4);
    unordered_map&lt;string, int&gt;::iterator it;
    for (it = m.begin(); it != m.end(); it&#43;&#43;) {
        cout &lt;&lt; it-&gt;first &lt;&lt; &#34; &#34; &lt;&lt; it-&gt;second &lt;&lt; endl;
    }
    // 顺序不确定

    m.erase(&#34;a&#34;);
    m.erase(&#34;b&#34;);
    for (it = m.begin(); it != m.end(); it&#43;&#43;) {
        cout &lt;&lt; it-&gt;first &lt;&lt; &#34; &#34; &lt;&lt; it-&gt;second &lt;&lt; endl;
    }
    // 顺序不确定

    cout &lt;&lt; m.count(&#34;c&#34;) &lt;&lt; endl;
    // 1
    cout &lt;&lt; m.count(&#34;e&#34;) &lt;&lt; endl;
    // 0

    if (m.find(&#34;c&#34;) != m.end()) {
        cout &lt;&lt; &#34;find c-&gt;&#34; &lt;&lt; m[&#34;c&#34;] &lt;&lt; endl;
    }
    if (m.find(&#34;e&#34;) == m.end()) {
        cout &lt;&lt; &#34;not find e&#34; &lt;&lt; endl;
    }
    return 0;
}
```

## 其他

### 元组 `tuple`

`tuple` 容器就是元组，其常用的成员函数有：

- `get&lt;i&gt;(tuple)`：获取元组中第 `i` 个元素的值
- `make_tuple(xxx, xxx, ……)`：创建一个元组
- `tie(xxx, xxx, ……)`：将元组中的值赋值给变量

```cpp
#include &lt;iostream&gt;
#include &lt;tuple&gt;

using namespace std;

int main() {
    tuple&lt;int, string, float&gt; t(1, &#34;a&#34;, 1.0);
    cout &lt;&lt; get&lt;0&gt;(t) &lt;&lt; endl;
    cout &lt;&lt; get&lt;1&gt;(t) &lt;&lt; endl;
    cout &lt;&lt; get&lt;2&gt;(t) &lt;&lt; endl;
    // 1
    // a
    // 1

    auto t2 = make_tuple(2, &#34;b&#34;, 2.0);
    cout &lt;&lt; get&lt;0&gt;(t2) &lt;&lt; endl;
    cout &lt;&lt; get&lt;1&gt;(t2) &lt;&lt; endl;
    cout &lt;&lt; get&lt;2&gt;(t2) &lt;&lt; endl;
    // 2
    // b
    // 2

    int a;
    string b;
    float c;
    tie(a, b, c) = t;
    cout &lt;&lt; a &lt;&lt; endl;
    cout &lt;&lt; b &lt;&lt; endl;
    cout &lt;&lt; c &lt;&lt; endl;
    // 1
    // a
    // 1
    return 0;
}
```

### 二元组 pair

`pair` 容器就是二元组，是元组的特例，其常用的成员函数有：

- `first`：获取二元组的第一个元素的值
- `second`：获取二元组的第二个元素的值
- `make_pair(xxx, xxx)`：创建一个二元组

```cpp
#include &lt;iostream&gt;
// utility 头文件中定义了 make_pair
#include &lt;utility&gt;

using namespace std;

int main() {
    pair&lt;int, string&gt; p(1, &#34;a&#34;);
    cout &lt;&lt; p.first &lt;&lt; endl;
    cout &lt;&lt; p.second &lt;&lt; endl;
    // 1
    // a

    auto p2 = make_pair(2, &#34;b&#34;);
    cout &lt;&lt; p2.first &lt;&lt; endl;
    cout &lt;&lt; p2.second &lt;&lt; endl;
    // 2
    // b
    return 0;
}
```


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/89c4acb1/  

