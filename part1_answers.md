# Route - Node.js Backend Assignment 3

## Part 1: Node Internals (3 Grades)

---

### 1. What is the Node.js Event Loop? (0.5 Grade)

**Definition:**
The **Event Loop** is the core mechanism that allows Node.js to perform non-blocking asynchronous I/O operations despite JavaScript being single-threaded. It constantly monitors both the **Call Stack** and the **Event Queues**, offloading heavy or I/O-bound tasks to the operating system kernel or the Libuv worker pool, and executing their callbacks on the main thread once the call stack is clear.

#### The 6 Phases of the Event Loop:
Each time the event loop runs through a full cycle (called a **tick**), it progresses through distinct phases in a specific order:
1. **Timers:** Executes callbacks scheduled by `setTimeout()` and `setInterval()`.
2. **Pending Callbacks:** Executes I/O callbacks deferred to the next loop iteration (such as certain system-level TCP errors).
3. **Idle, Prepare:** Used internally by Libuv for internal house-keeping.
4. **Poll:** Retrieves new I/O events; executes callbacks for almost all I/O operations (file reading, incoming HTTP requests, database responses). If the poll queue is empty, the loop will wait here for new I/O events or advance to check/timers.
5. **Check:** Executes callbacks registered by `setImmediate()`.
6. **Close Callbacks:** Executes callbacks for closed resources, such as `socket.on('close', ...)`.

> **Note on Microtasks:** Microtask queues (specifically `process.nextTick()` and `Promise` resolutions) are executed with highest priority immediately after the current operation finishes, before moving to the next phase of the event loop.

---

### 2. What is Libuv and What Role Does It Play in Node.js? (0.5 Grade)

**Definition:**
**Libuv** is a high-performance, open-source multi-platform C library originally developed specifically for Node.js. It bridges Node.js with the underlying operating system.

#### Key Roles of Libuv in Node.js:
1. **Implements the Event Loop:** Libuv manages the actual event loop cycles, event queues, and phase dispatching.
2. **Cross-Platform Asynchronous I/O Abstraction:** It provides a unified API across different operating systems by leveraging OS-specific notification mechanisms:
   - **epoll** on Linux
   - **kqueue** on macOS / BSD
   - **IOCP (Input/Output Completion Ports)** on Windows
3. **Thread Pool (Worker Pool):** For tasks that the OS kernel cannot perform asynchronously (such as file system operations, DNS lookups, and CPU-bound crypto/compression), Libuv provides a pool of worker threads.
4. **Handles Child Processes, Timers, and Signal Handling:** Manages inter-process communication (IPC), process signals, and high-resolution timers.

---

### 3. How Does Node.js Handle Asynchronous Operations Under the Hood? (0.5 Grade)

Node.js combines the **V8 JavaScript engine**, the **Libuv library**, and the **OS Kernel** to handle asynchronous tasks under the hood:

```
+-----------------------------------------------------------+
|                   V8 Engine (Call Stack)                 |
|             Executes synchronous JavaScript code          |
+-----------------------------------------------------------+
                             |
             Delegates Asynchronous Operation
                             |
                             v
+-----------------------------------------------------------+
|                       Libuv Core                          |
|  +-----------------------------+  +--------------------+  |
|  |       Operating System      |  | Libuv Thread Pool  |  |
|  | (Network I/O, epoll / IOCP) |  | (File I/O, Crypto) |  |
|  +-----------------------------+  +--------------------+  |
+-----------------------------------------------------------+
                             |
                   Operation Completes
                             |
                             v
+-----------------------------------------------------------+
|             Event Queue (Callback / Task Queue)           |
+-----------------------------------------------------------+
                             |
              Event Loop pushes callback when
                   Call Stack is empty
                             |
                             v
+-----------------------------------------------------------+
|                   V8 Engine (Call Stack)                 |
|               Executes the callback function              |
+-----------------------------------------------------------+
```

1. **Initiation:** When an async function (e.g., `fs.readFile` or `http.get`) is invoked on the main thread, Node.js passes the request and callback to Libuv.
2. **Offloading:**
   - **Network Operations (HTTP, Sockets):** Delegated directly to the OS kernel via non-blocking sockets (using epoll / kqueue / IOCP). No threads are wasted.
   - **File System & CPU-bound Tasks:** Delegated to Libuv's background **Thread Pool**.
3. **Continuation:** The main thread is immediately free to continue executing the rest of the JavaScript code without waiting.
4. **Completion:** When the background operation finishes, Libuv places the associated callback into the Event Queue.
5. **Execution:** Once the Call Stack is empty, the Event Loop takes the callback from the queue and pushes it onto the Call Stack for execution.

---

### 4. What is the Difference Between the Call Stack, Event Queue, and Event Loop in Node.js? (0.5 Grade)

| Feature | **Call Stack** | **Event Queue (Task / Callback Queue)** | **Event Loop** |
| :--- | :--- | :--- | :--- |
| **Data Structure** | **LIFO** (Last In, First Out) | **FIFO** (First In, First Out) | Infinite Loop / Process Monitor |
| **Where it Lives** | Inside the **V8 Engine** | Inside **Libuv** | Inside **Libuv** |
| **Primary Role** | Tracks currently executing synchronous functions and active execution contexts. | Stores completed asynchronous callbacks waiting to be executed. | Coordinates between the Call Stack and Event Queue. |
| **Thread Model** | Single thread (the main JavaScript thread). | Managed across Libuv queues. | Runs continuously on the main thread. |
| **Action** | When a function is called, it is pushed; when it returns, it is popped. | Callbacks are queued when background operations finish. | Checks if Call Stack is empty; if empty, dequeues callback and pushes to Call Stack. |

---

### 5. What is the Node.js Thread Pool and How to Set the Thread Pool Size? (0.5 Grade)

#### What is the Node.js Thread Pool?
Although JavaScript is single-threaded, Libuv maintains a multi-threaded **Worker Pool** (Thread Pool). This pool handles operations that operating system kernels cannot handle through non-blocking notification systems.
The thread pool is used for:
1. **File System Operations (`fs` module):** `fs.readFile`, `fs.writeFile`, etc.
2. **DNS Operations:** `dns.lookup()`.
3. **Cryptographic Functions (`crypto` module):** `crypto.pbkdf2()`, `crypto.randomBytes()`, `crypto.scrypt()`, etc.
4. **Compression (`zlib` module):** `zlib.gzip()`, `zlib.deflate()`, etc.

The default size of the Libuv thread pool is **4 threads**.

#### How to Set the Thread Pool Size:
You can adjust the size using the `UV_THREADPOOL_SIZE` environment variable (minimum is **1**, maximum is **1024**).

- **In Windows (PowerShell):**
  ```powershell
  $env:UV_THREADPOOL_SIZE = 8; node index.js
  ```
- **In Windows (CMD):**
  ```cmd
  set UV_THREADPOOL_SIZE=8 && node index.js
  ```
- **In Linux / macOS (Bash):**
  ```bash
  UV_THREADPOOL_SIZE=8 node index.js
  ```
- **Inside JavaScript code (must be executed at the very beginning of the entry file before any async call or module import that uses Libuv):**
  ```javascript
  process.env.UV_THREADPOOL_SIZE = 8;
  ```

---

### 6. How Does Node.js Handle Blocking and Non-Blocking Code Execution? (0.5 Grade)

#### Blocking Code Execution (Synchronous):
- **Definition:** Code that halts (blocks) the execution of additional JavaScript in the Node.js process until the current operation completes.
- **Mechanism:** The operation remains on the **Call Stack** throughout its entire duration, preventing the Event Loop from processing any other code, incoming HTTP requests, or pending callbacks.
- **Example:**
  ```javascript
  const fs = require('fs');
  // Blocks the main thread completely until file reading completes
  const data = fs.readFileSync('users.json', 'utf8');
  console.log(data);
  ```
- **Risk:** High CPU computations or synchronous I/O cause the entire server to freeze for all users.

#### Non-Blocking Code Execution (Asynchronous):
- **Definition:** Code that initiates an operation and delegates it immediately to the background (Libuv thread pool or OS kernel), allowing the Call Stack to immediately proceed to the next line of code.
- **Mechanism:** When the background operation completes, its callback or promise resolution is placed in the Event Queue. The Event Loop then pushes it onto the Call Stack when free.
- **Example:**
  ```javascript
  const fs = require('fs').promises;
  // Non-blocking: delegates reading to thread pool and continues immediately
  fs.readFile('users.json', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));
  console.log('This prints immediately without waiting!');
  ```
- **Benefit:** Maximizes throughput and scalability, allowing a single Node.js instance to handle thousands of concurrent requests concurrently.
