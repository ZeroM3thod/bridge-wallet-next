var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// api/admin/package-image.ts
var json = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status }), "json");
var onRequestPost = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const id = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  const row = id && await env2.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first();
  if (row?.role !== "admin") return json({ error: "Not found" }, 404);
  try {
    const form = await request.formData(), file = form.get("image"), packageId = form.get("packageId");
    if (!(file instanceof File) || typeof packageId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(packageId) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) return json({ error: "Choose JPG, PNG or WebP under 5 MB" }, 400);
    const key = `packages/${packageId}`;
    await env2.PACKAGE_IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=3600" } });
    await env2.DB.prepare("UPDATE packages SET image_key=?,updated_at=? WHERE id=?").bind(key, Date.now(), packageId).run();
    return json({ imageUrl: `/api/package-images/${packageId}?v=${Date.now()}` });
  } catch (error3) {
    console.error(error3);
    return json({ error: "Image upload failed" }, 500);
  }
}, "onRequestPost");
var onRequestDelete = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const id = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  const row = id && await env2.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first();
  if (row?.role !== "admin") return json({ error: "Not found" }, 404);
  try {
    const { packageId } = await request.json();
    if (!packageId || !/^[a-zA-Z0-9_-]{1,100}$/.test(packageId)) return json({ error: "Invalid package" }, 400);
    const result = await env2.DB.prepare("SELECT image_key FROM packages WHERE id=?").bind(packageId).first();
    if (result?.image_key) await env2.PACKAGE_IMAGES.delete(result.image_key);
    await env2.DB.prepare("UPDATE packages SET image_key='',updated_at=? WHERE id=?").bind(Date.now(), packageId).run();
    return json({ success: true });
  } catch (error3) {
    console.error(error3);
    return json({ error: "Image removal failed" }, 500);
  }
}, "onRequestDelete");

// api/auth/logout.ts
async function onRequestPost2({ request }) {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
    }
  });
}
__name(onRequestPost2, "onRequestPost");

// api/auth/session.ts
async function onRequestGet({ request, env: env2 }) {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sessionId) return Response.json({ error: "\u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8" }, { status: 401 });
  const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?").bind(sessionId, Date.now()).first();
  if (!session) return Response.json({ error: "\u09B8\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7" }, {
    status: 401,
    headers: { "Set-Cookie": "session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" }
  });
  return Response.json({ success: true });
}
__name(onRequestGet, "onRequestGet");

// api/auth/signin.ts
var hashPassword = /* @__PURE__ */ __name(async (password) => {
  const hash3 = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(hash3), (byte) => byte.toString(16).padStart(2, "0")).join("");
}, "hashPassword");
async function onRequestPost3({ request, env: env2 }) {
  try {
    const { identifier, password } = await request.json();
    if (!identifier?.trim() || !password) {
      return Response.json({ error: "\u09B8\u09AC \u09A4\u09A5\u09CD\u09AF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8" }, { status: 400 });
    }
    const value = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const phone = value.replace(/[০-৯]/g, (digit) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(digit))).replace(/\s/g, "");
    if (!isEmail && !/^0?1\d{9}$/.test(phone)) {
      return Response.json({ error: "\u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09AC\u09BE \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8" }, { status: 400 });
    }
    const hash3 = await hashPassword(password);
    const user = await env2.DB.prepare(
      isEmail ? 'SELECT id, email, name, COALESCE(role_text, role, "user") as role FROM users WHERE email = ? AND password_hash = ?' : 'SELECT id, email, name, COALESCE(role_text, role, "user") as role FROM users WHERE phone = ? AND password_hash = ?'
    ).bind(isEmail ? value.toLowerCase() : phone, hash3).first();
    if (!user) return Response.json({ error: "\u0987\u09AE\u09C7\u0987\u09B2/\u09AB\u09CB\u09A8 \u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC" }, { status: 401 });
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    await env2.DB.prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").bind(sessionId, user.id, now, now + 5 * 60 * 60 * 1e3).run();
    return Response.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, {
      headers: { "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=18000` }
    });
  } catch (error3) {
    console.error("Signin error:", error3);
    return Response.json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, { status: 500 });
  }
}
__name(onRequestPost3, "onRequestPost");

// api/cron/credit-daily-profits.ts
var onRequestPost4 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  if (!env2.CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${env2.CRON_SECRET}`) return new Response("Not found", { status: 404 });
  const now = Date.now();
  try {
    const { results = [] } = await env2.DB.prepare("SELECT id,user_id,package_id,daily_profit,duration_days,started_at FROM user_packages WHERE status='active' AND started_at<=? AND expires_at>? LIMIT 500").bind(now, now).all();
    let credited = 0;
    for (const pkg of results) {
      const day = Math.floor((now - pkg.started_at) / 864e5) + 1;
      if (day > pkg.duration_days) continue;
      const amount = pkg.daily_profit;
      if (amount <= 0) continue;
      const id = crypto.randomUUID();
      const result = await env2.DB.batch([
        env2.DB.prepare("INSERT OR IGNORE INTO daily_profits (id,user_package_id,user_id,package_id,day_number,amount,credited_at,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(id, pkg.id, pkg.user_id, pkg.package_id, day, amount, now, now),
        env2.DB.prepare("UPDATE users SET balance=balance+? WHERE id=? AND changes()=1").bind(amount, pkg.user_id),
        env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'\u09A6\u09C8\u09A8\u09BF\u0995 \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u09B2\u09BE\u09AD',? WHERE changes()=1").bind(crypto.randomUUID(), pkg.user_id, amount, now)
      ]);
      credited += result[0].meta.changes;
    }
    return Response.json({ success: true, credited });
  } catch (error3) {
    console.error(error3);
    return Response.json({ error: "Profit credit failed" }, { status: 500 });
  }
}, "onRequestPost");

// api/deposits/create.ts
var PAYMENT_API_URL = "https://imcagro.top";
var json2 = /* @__PURE__ */ __name((body, status = 200) => Response.json(body, { status }), "json");
var makeOutTradeNo = /* @__PURE__ */ __name(() => {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0] % 1e4;
  return `${Date.now()}${String(rand).padStart(4, "0")}`;
}, "makeOutTradeNo");
async function onRequestGet2({ env: env2 }) {
  const settings = await env2.DB.prepare("SELECT minimum_amount FROM deposit_settings WHERE id=1").first();
  return json2({ minimumAmount: settings?.minimum_amount ?? 300 });
}
__name(onRequestGet2, "onRequestGet");
async function onRequestPost5({ request, env: env2 }) {
  try {
    const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
    if (!sessionId) return json2({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, 401);
    const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?").bind(sessionId, Date.now()).first();
    if (!session) return json2({ error: "\u09B8\u09C7\u09B6\u09A8 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6\u09CB\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3" }, 401);
    const body = await request.json();
    const settings = await env2.DB.prepare("SELECT minimum_amount FROM deposit_settings WHERE id=1").first();
    const minimumAmount = (settings?.minimum_amount ?? 300) * 100;
    if (!Number.isSafeInteger(body.amount) || (body.amount ?? 0) < minimumAmount || body.amount % 100 !== 0 || !["BKASH", "NAGAD", "ROCKET", "BKASH-C", "NAGAD-C"].includes(body.method ?? "")) return json2({ error: `\u09B8\u09A0\u09BF\u0995 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF \u0993 \u09A8\u09CD\u09AF\u09C2\u09A8\u09A4\u09AE \u09F3${settings?.minimum_amount ?? 300} \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u09A6\u09BF\u09A8` }, 400);
    const depositId = crypto.randomUUID();
    const outTradeNo = makeOutTradeNo();
    await env2.DB.prepare(
      "INSERT INTO deposits (id,user_id,out_trade_no,method,amount,status,created_at) VALUES (?,?,?,?,?,'pending',?)"
    ).bind(depositId, session.user_id, outTradeNo, body.method.startsWith("NAGAD") ? "NAGAD" : "BKASH", body.amount, Date.now()).run();
    await env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,new_status,note,created_at) VALUES (?,?, 'created','pending','Deposit request created',?)").bind(crypto.randomUUID(), depositId, Date.now()).run();
    const markFailed = /* @__PURE__ */ __name(async (note) => {
      const now = Date.now();
      await env2.DB.batch([
        env2.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(outTradeNo),
        env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,previous_status,new_status,note,created_at) SELECT ?,?,'failed','pending','failed',?,? WHERE changes()>0").bind(crypto.randomUUID(), depositId, note, now)
      ]);
    }, "markFailed");
    let result;
    try {
      const gatewayResponse = await fetch(`${(env2.PAYMENT_API_URL || PAYMENT_API_URL).replace(/\/$/, "")}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(body.amount / 100), orderId: outTradeNo, payType: body.method, attach: depositId, returnUrl: `${new URL("/deposit", request.url).toString()}?order=${encodeURIComponent(outTradeNo)}` })
      });
      const raw = await gatewayResponse.text();
      try {
        result = JSON.parse(raw);
      } catch {
        throw new Error(`Payment API HTTP ${gatewayResponse.status}; non-JSON response: ${raw.replace(/\s+/g, " ").slice(0, 500) || "(empty)"}`);
      }
      if (!gatewayResponse.ok) throw new Error(`Payment API HTTP ${gatewayResponse.status}: ${result.error || result.message || JSON.stringify(result).slice(0, 500)}`);
    } catch (err) {
      console.error("Gateway request/parse failed:", err);
      await markFailed("Payment gateway request failed");
      return json2({ error: err instanceof Error ? err.message : String(err) }, 502);
    }
    if (!result.success || !result.paymentUrl) {
      await markFailed("Payment gateway rejected request");
      return json2({ error: `Payment API rejected order: ${result.error || result.message || JSON.stringify(result).slice(0, 500)}` }, 502);
    }
    let paymentUrl;
    try {
      paymentUrl = new URL(result.paymentUrl);
    } catch {
      await markFailed("Gateway returned invalid payment URL");
      return json2({ error: "\u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F URL \u0997\u09CD\u09B0\u09B9\u09A3\u09AF\u09CB\u0997\u09CD\u09AF \u09A8\u09AF\u09BC" }, 502);
    }
    if (paymentUrl.protocol !== "https:") {
      await markFailed("Gateway returned insecure payment URL");
      return json2({ error: "\u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F URL \u0997\u09CD\u09B0\u09B9\u09A3\u09AF\u09CB\u0997\u09CD\u09AF \u09A8\u09AF\u09BC" }, 502);
    }
    await env2.DB.prepare("UPDATE deposits SET gateway_transaction_id=? WHERE out_trade_no=?").bind(result.transactionId || null, outTradeNo).run();
    return json2({ success: true, paymentUrl: paymentUrl.toString() });
  } catch (error3) {
    console.error("Create deposit error:", error3);
    return json2({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, 500);
  }
}
__name(onRequestPost5, "onRequestPost");

// api/deposits/status.ts
async function onRequestGet3({ request, env: env2 }) {
  const json13 = /* @__PURE__ */ __name((body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } }), "json");
  try {
    const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
    if (!sessionId) return json13({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, 401);
    const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sessionId, Date.now()).first();
    if (!session) return json13({ error: "\u09B8\u09C7\u09B6\u09A8 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6\u09CB\u09A4\u09CD\u09A4\u09C0\u09B0\u09CD\u09A3" }, 401);
    const order = new URL(request.url).searchParams.get("order");
    if (!order) return json13({ error: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A8\u09C7\u0987" }, 400);
    const deposit = await env2.DB.prepare("SELECT status FROM deposits WHERE out_trade_no=? AND user_id=?").bind(order, session.user_id).first();
    return deposit ? json13({ status: deposit.status }) : json13({ error: "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 404);
  } catch (error3) {
    console.error("Deposit status lookup failed:", error3);
    return json13({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, 500);
  }
}
__name(onRequestGet3, "onRequestGet");

// lib/md5.ts
var shifts = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
var constants = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);
function md5(input) {
  const bytes = new TextEncoder().encode(input);
  const length = bytes.length;
  const paddedLength = Math.ceil((length + 9) / 64) * 64;
  const data = new Uint8Array(paddedLength);
  data.set(bytes);
  data[length] = 128;
  const view = new DataView(data.buffer);
  view.setUint32(paddedLength - 8, length * 8 >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(length / 536870912), true);
  let a0 = 1732584193, b0 = 4023233417, c0 = 2562383102, d0 = 271733878;
  for (let offset = 0; offset < paddedLength; offset += 64) {
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f, g, shift;
      if (i < 16) {
        f = b & c | ~b & d;
        g = i;
        shift = shifts[i % 4];
      } else if (i < 32) {
        f = d & b | ~d & c;
        g = (5 * i + 1) % 16;
        shift = shifts[4 + i % 4];
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
        shift = shifts[8 + i % 4];
      } else {
        f = c ^ (b | ~d);
        g = 7 * i % 16;
        shift = shifts[12 + i % 4];
      }
      const word = view.getUint32(offset + g * 4, true);
      const sum = a + f + constants[i] + word >>> 0;
      const rotated = sum << shift | sum >>> 32 - shift;
      [a, d, c, b] = [d, c, b, b + rotated >>> 0];
    }
    a0 = a0 + a >>> 0;
    b0 = b0 + b >>> 0;
    c0 = c0 + c >>> 0;
    d0 = d0 + d >>> 0;
  }
  return [a0, b0, c0, d0].map((n) => [0, 1, 2, 3].map((i) => (n >>> i * 8 & 255).toString(16).padStart(2, "0")).join("")).join("");
}
__name(md5, "md5");

// api/deposits/webhook.ts
var PAID_STATUSES = ["1", "success", "SUCCESS", "paid", "PAID"];
var FAILED_STATUSES = ["2", "fail", "FAIL", "failed", "FAILED"];
var CANCELLED_STATUSES = ["cancel", "cancelled", "canceled", "CANCELLED", "CANCELED"];
var byCodeUnit = /* @__PURE__ */ __name(([a], [b]) => a < b ? -1 : a > b ? 1 : 0, "byCodeUnit");
async function onRequestPost6({ request, env: env2 }) {
  try {
    if (!env2.OKEXPAY_KEY) return new Response("fail", { status: 400 });
    const contentType = request.headers.get("content-type") || "";
    let data;
    if (contentType.includes("json")) {
      const raw = await request.json();
      data = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v == null ? "" : String(v)]));
    } else {
      data = Object.fromEntries((await request.formData()).entries());
    }
    console.log("Deposit webhook payload:", contentType, JSON.stringify(data));
    const order = data.out_trade_no;
    const signature = (data.sign || data.Sign || "").toLowerCase();
    const amount = Number(data.money);
    if (!order || !signature) return new Response("fail", { status: 400 });
    const expectedMch = env2.OKEXPAY_MCH_ID || "5393";
    if (data.mchId && data.mchId !== expectedMch) return new Response("fail", { status: 400 });
    const signedFields = Object.fromEntries(Object.entries(data).filter(([key, value]) => key !== "sign" && key !== "Sign" && value !== "").sort(byCodeUnit));
    const signText = Object.entries(signedFields).map(([k, v]) => `${k}=${v}`).join("&") + `&key=${env2.OKEXPAY_KEY}`;
    if (md5(signText) !== signature) return new Response("fail", { status: 400 });
    const deposit = await env2.DB.prepare("SELECT user_id, amount, status FROM deposits WHERE out_trade_no=?").bind(order).first();
    if (!deposit) return new Response("fail", { status: 404 });
    if (deposit.status === "paid") return new Response("success");
    const status = String(data.status || data.trade_status || "").trim().toLowerCase();
    if (FAILED_STATUSES.includes(status)) {
      const now2 = Date.now();
      await env2.DB.batch([
        env2.DB.prepare("UPDATE deposits SET status='failed' WHERE out_trade_no=? AND status='pending'").bind(order),
        env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,previous_status,new_status,note,created_at) SELECT ?,id,'failed','pending','failed','Gateway reported payment failure',? FROM deposits WHERE out_trade_no=? AND changes()>0").bind(crypto.randomUUID(), now2, order)
      ]);
      return new Response("success");
    }
    if (CANCELLED_STATUSES.includes(status)) {
      const now2 = Date.now();
      await env2.DB.batch([
        env2.DB.prepare("UPDATE deposits SET status='cancelled' WHERE out_trade_no=? AND status='pending'").bind(order),
        env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,previous_status,new_status,note,created_at) SELECT ?,id,'cancelled','pending','cancelled','Gateway reported payment cancellation',? FROM deposits WHERE out_trade_no=? AND changes()>0").bind(crypto.randomUUID(), now2, order)
      ]);
      return new Response("success");
    }
    if (!PAID_STATUSES.includes(status)) return new Response("fail", { status: 400 });
    if (!Number.isFinite(amount) || Math.round(amount * 100) !== deposit.amount) {
      console.error("Deposit amount mismatch", { order, got: data.money, expected: deposit.amount });
      return new Response("fail", { status: 400 });
    }
    const now = Date.now();
    await env2.DB.batch([
      env2.DB.prepare("UPDATE deposits SET status='paid', paid_at=? WHERE out_trade_no=? AND status='pending'").bind(now, order),
      env2.DB.prepare("UPDATE users SET balance=balance+? WHERE id=? AND changes() > 0").bind(deposit.amount / 100, deposit.user_id),
      env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'\u0993\u09AF\u09BC\u09BE\u09B2\u09C7\u099F\u09C7 \u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE',? WHERE changes() > 0").bind(crypto.randomUUID(), deposit.user_id, deposit.amount / 100, now),
      env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,event,previous_status,new_status,note,created_at) SELECT ?,id,'paid','pending','paid','Payment confirmed by gateway',? FROM deposits WHERE out_trade_no=? AND changes()>0").bind(crypto.randomUUID(), now, order)
    ]);
    return new Response("success");
  } catch (error3) {
    console.error("Deposit webhook error:", error3);
    return new Response("fail", { status: 500 });
  }
}
__name(onRequestPost6, "onRequestPost");

// api/packages/purchase.ts
var json3 = /* @__PURE__ */ __name((body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } }), "json");
var onRequestPost7 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sessionId) return json3({ error: "\u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8" }, 401);
  try {
    const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sessionId, Date.now()).first();
    if (!session) return json3({ error: "\u09B8\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09B6\u09C7\u09B7" }, 401);
    const body = await request.json();
    if (typeof body.packageId !== "string" || !body.packageId) return json3({ error: "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8" }, 400);
    const pkg = await env2.DB.prepare("SELECT * FROM packages WHERE id=? AND visible=1").bind(body.packageId).first();
    if (!pkg) return json3({ error: "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 404);
    const user = await env2.DB.prepare("SELECT balance,COALESCE(vip_level,0) AS vip_level FROM users WHERE id=?").bind(session.user_id).first();
    if (!user) return json3({ error: "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 404);
    if (user.balance < pkg.price) return json3({ error: "\u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09A8\u09C7\u0987" }, 400);
    const count3 = await env2.DB.prepare("SELECT COUNT(*) AS n FROM user_packages WHERE user_id=? AND package_id=?").bind(session.user_id, pkg.id).first();
    if (pkg.max_per_user && count3.n >= pkg.max_per_user) return json3({ error: "\u098F\u0987 \u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u0995\u09C7\u09A8\u09BE\u09B0 \u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09B8\u09C0\u09AE\u09BE \u09AA\u09C2\u09B0\u09CD\u09A3" }, 400);
    if (user.vip_level < pkg.min_vip_level) return json3({ error: `\u0985\u09AD\u09BF\u099C\u09BE\u09A4 \u09A7\u09BE\u09AA ${pkg.min_vip_level} \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8` }, 400);
    const now = Date.now(), purchaseId = crypto.randomUUID();
    const result = await env2.DB.batch([
      env2.DB.prepare("UPDATE users SET balance=balance-? WHERE id=? AND balance>=?").bind(pkg.price, session.user_id, pkg.price),
      env2.DB.prepare("INSERT INTO user_packages (id,user_id,package_id,price_paid,daily_rate,duration_days,started_at,expires_at,status,created_at,daily_profit) SELECT ?,?,?,?,?,?,?,?,'active',?,? WHERE EXISTS (SELECT 1 FROM users WHERE id=? AND balance=?)").bind(purchaseId, session.user_id, pkg.id, pkg.price, pkg.daily_rate, pkg.duration_days, now, now + pkg.duration_days * 864e5, now, pkg.daily_profit, session.user_id, user.balance - pkg.price),
      env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'debit',?,'\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u0995\u09CD\u09B0\u09AF\u09BC',? WHERE EXISTS (SELECT 1 FROM user_packages WHERE id=?)").bind(crypto.randomUUID(), session.user_id, pkg.price, now, purchaseId)
    ]);
    if (!result[0].meta.changes || !result[1].meta.changes) return json3({ error: "\u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7; \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8" }, 409);
    return json3({ success: true, balance: user.balance - pkg.price });
  } catch (error3) {
    console.error("Package purchase failed", error3);
    return json3({ error: "\u0995\u09CD\u09B0\u09AF\u09BC \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u09B9\u09AF\u09BC\u09A8\u09BF" }, 500);
  }
}, "onRequestPost");

// api/admin/deposits.ts
var json4 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
async function adminId(request, db) {
  const id = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!id) return null;
  const row = await db.prepare('SELECT u.id,COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first();
  return row?.role === "admin" ? row.id : null;
}
__name(adminId, "adminId");
var onRequest = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const actorId = await adminId(request, env2.DB);
  if (!actorId) return json4({ error: "Not found" }, 404);
  if (request.method === "GET") {
    const [rows, events, settings] = await Promise.all([
      env2.DB.prepare("SELECT d.id,d.out_trade_no,d.gateway_transaction_id,d.method,d.amount,d.status,d.created_at,d.paid_at,u.id AS user_id,u.name,u.phone,u.email,u.balance FROM deposits d JOIN users u ON u.id=d.user_id ORDER BY d.created_at DESC").all(),
      env2.DB.prepare("SELECT e.id,e.deposit_id,e.actor_id,e.event,e.previous_status,e.new_status,e.note,e.created_at,u.name AS actor_name FROM deposit_events e LEFT JOIN users u ON u.id=e.actor_id ORDER BY e.created_at DESC").all(),
      env2.DB.prepare("SELECT minimum_amount FROM deposit_settings WHERE id=1").first()
    ]);
    return json4({ deposits: rows.results, events: events.results, settings: { minimum_amount: settings?.minimum_amount ?? 300 } });
  }
  if (request.method !== "POST") return json4({ error: "Method not allowed" }, 405);
  try {
    const body = await request.json();
    if (body.action === "settings") {
      if (!Number.isSafeInteger(body.minimumAmount) || Number(body.minimumAmount) < 1) return json4({ error: "Minimum deposit must be a positive whole number" }, 400);
      await env2.DB.prepare("UPDATE deposit_settings SET minimum_amount=?,updated_at=? WHERE id=1").bind(body.minimumAmount, Date.now()).run();
      return json4({ success: true });
    }
    if (typeof body.id !== "string" || !["approve", "reject"].includes(String(body.action))) return json4({ error: "Invalid request" }, 400);
    const row = await env2.DB.prepare("SELECT user_id,amount FROM deposits WHERE id=?").bind(body.id).first();
    if (!row) return json4({ error: "Deposit not found" }, 404);
    if (!Number.isSafeInteger(row.amount) || row.amount <= 0 || row.amount % 100 !== 0) return json4({ error: "Invalid deposit amount" }, 409);
    const walletAmount = row.amount / 100;
    const now = Date.now();
    const statements = body.action === "approve" ? [
      env2.DB.prepare("UPDATE deposits SET status='paid',paid_at=? WHERE id=? AND status='failed'").bind(now, body.id),
      env2.DB.prepare("UPDATE users SET balance=balance+? WHERE id=? AND changes()>0").bind(walletAmount, row.user_id),
      env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'\u0993\u09AF\u09BC\u09BE\u09B2\u09C7\u099F\u09C7 \u099F\u09BE\u0995\u09BE \u099C\u09AE\u09BE',? WHERE changes()>0").bind(crypto.randomUUID(), row.user_id, walletAmount, now),
      env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,actor_id,event,previous_status,new_status,note,created_at) SELECT ?,?,?,'approved','failed','paid','Admin approved deposit',? WHERE changes()>0").bind(crypto.randomUUID(), body.id, actorId, now)
    ] : [
      env2.DB.prepare("UPDATE deposits SET status='rejected' WHERE id=? AND status='paid' AND EXISTS (SELECT 1 FROM users WHERE id=deposits.user_id AND balance>=deposits.amount/100)").bind(body.id),
      env2.DB.prepare("UPDATE users SET balance=balance-? WHERE id=? AND changes()>0").bind(walletAmount, row.user_id),
      env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'debit',?,'\u09A1\u09BF\u09AA\u09CB\u099C\u09BF\u099F \u09B0\u09BF\u09AD\u09BE\u09B0\u09CD\u09B8\u09BE\u09B2',? WHERE changes()>0").bind(crypto.randomUUID(), row.user_id, walletAmount, now),
      env2.DB.prepare("INSERT INTO deposit_events (id,deposit_id,actor_id,event,previous_status,new_status,note,created_at) SELECT ?,?,?,'rejected','paid','rejected','Admin rejected deposit and reversed wallet credit',? WHERE changes()>0").bind(crypto.randomUUID(), body.id, actorId, now)
    ];
    await env2.DB.batch(statements);
    const updated = await env2.DB.prepare("SELECT status FROM deposits WHERE id=?").bind(body.id).first();
    const expected = body.action === "approve" ? "paid" : "rejected";
    if (updated?.status !== expected) return json4({ error: body.action === "reject" ? "Deposit is not approved or user balance is insufficient" : "Only failed deposits can be approved" }, 409);
    return json4({ success: true, status: expected });
  } catch (error3) {
    console.error("Admin deposit review failed:", error3);
    return json4({ error: "Review failed" }, 500);
  }
}, "onRequest");

// api/admin/packages.ts
var json5 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
async function admin(request, db) {
  const id = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!id) return false;
  const row = await db.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first();
  return row?.role === "admin";
}
__name(admin, "admin");
var onRequest2 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  if (!await admin(request, env2.DB)) return json5({ error: "Not found" }, 404);
  if (request.method === "GET") {
    let rows;
    try {
      rows = await env2.DB.prepare("SELECT id,name,short_description AS shortDescription,model_no AS modelNo,tank_overview AS tankOverview,profit_mechanism AS profitMechanism,price,daily_profit AS dailyProfit,duration_days AS durationDays,max_per_user AS maxPerUser,min_vip_level AS minVipLevel,stock_limit AS stockLimit,min_active_referrals AS minActiveReferrals,requires_package_id AS requiresPackageId,allow_while_active AS allowWhileActive,visible,CASE WHEN image_key='' THEN '' ELSE '/api/package-images/'||id||'?v='||updated_at END AS imageUrl FROM packages ORDER BY price").all();
    } catch {
      rows = await env2.DB.prepare("SELECT id,name,price,300 AS dailyProfit,duration_days AS durationDays,max_per_user AS maxPerUser,stock_limit AS stockLimit,min_active_referrals AS minActiveReferrals,requires_package_id AS requiresPackageId,allow_while_active AS allowWhileActive,visible,'' AS imageUrl FROM packages ORDER BY price").all();
    }
    return json5({ packages: rows.results });
  }
  if (request.method !== "PUT") return json5({ error: "Method not allowed" }, 405);
  try {
    const body = await request.json();
    if (!Array.isArray(body.packages) || body.packages.length > 100) return json5({ error: "Invalid package list" }, 400);
    const ids = /* @__PURE__ */ new Set(), now = Date.now();
    const statements = [];
    for (const p of body.packages) {
      if (!p || typeof p.id !== "string" || !p.id.trim() || ids.has(p.id) || typeof p.name !== "string" || !p.name.trim() || ![p.shortDescription, p.modelNo, p.tankOverview, p.profitMechanism].every((v) => typeof v === "string") || !Number.isSafeInteger(p.price) || p.price <= 0 || !Number.isSafeInteger(p.dailyProfit) || p.dailyProfit <= 0 || !Number.isSafeInteger(p.durationDays) || p.durationDays < 1 || ![p.maxPerUser, p.minVipLevel].every((n) => Number.isSafeInteger(n) && n >= 0) || typeof p.allowWhileActive !== "boolean" || typeof p.visible !== "boolean") return json5({ error: "Invalid package fields" }, 400);
      ids.add(p.id);
      statements.push(env2.DB.prepare("INSERT INTO packages (id,name,short_description,model_no,tank_overview,profit_mechanism,price,daily_rate,duration_days,max_per_user,min_vip_level,stock_limit,min_active_referrals,requires_package_id,allow_while_active,visible,image_key,created_at,updated_at,daily_profit) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,short_description=excluded.short_description,model_no=excluded.model_no,tank_overview=excluded.tank_overview,profit_mechanism=excluded.profit_mechanism,price=excluded.price,duration_days=excluded.duration_days,max_per_user=excluded.max_per_user,min_vip_level=excluded.min_vip_level,stock_limit=excluded.stock_limit,min_active_referrals=excluded.min_active_referrals,requires_package_id=excluded.requires_package_id,allow_while_active=excluded.allow_while_active,visible=excluded.visible,image_key=excluded.image_key,daily_profit=excluded.daily_profit,updated_at=excluded.updated_at").bind(p.id, p.name.trim(), p.shortDescription, p.modelNo, p.tankOverview, p.profitMechanism, p.price, 1, p.durationDays, p.maxPerUser, p.minVipLevel, p.stockLimit, p.minActiveReferrals, p.requiresPackageId || "", +p.allowWhileActive, +p.visible, p.imageUrl ? p.id : "", now, now, p.dailyProfit));
    }
    statements.push(env2.DB.prepare(`UPDATE packages SET visible=0,updated_at=? WHERE id NOT IN (${ids.size ? [...ids].map(() => "?").join(",") : "''"})`).bind(now, ...ids));
    if (statements.length) await env2.DB.batch(statements);
    return json5({ success: true, saved: statements.length });
  } catch (error3) {
    console.error(error3);
    return json5({ error: "Save failed" }, 500);
  }
}, "onRequest");

// api/admin/referrals.ts
var defaults = {
  general: { enabled: true, requireCodeAtSignup: false, blockSelfReferral: true, activeWhen: "min_vip", activeMinVip: 1, activeMinDeposit: 500, maxBonusPerUser: 0 },
  commissions: { levels: [
    { level: 1, enabled: true, title: "\u09E7\u09AE \u09B2\u09C7\u09AD\u09C7\u09B2", depositBonus: 8, profitCommission: 8 },
    { level: 2, enabled: true, title: "\u09E8\u09AF\u09BC \u09B2\u09C7\u09AD\u09C7\u09B2", depositBonus: 3, profitCommission: 3 },
    { level: 3, enabled: true, title: "\u09E9\u09AF\u09BC \u09B2\u09C7\u09AD\u09C7\u09B2", depositBonus: 1, profitCommission: 1 }
  ], depositBonusOn: "every", minDepositForBonus: 0, payout: "instant", maxCommissionPerMember: 0 },
  salary: { enabled: true, minVip: 1, cycle: "monthly", onePerCycle: true, needsApproval: true, tiers: [
    { id: "t1", icon: "\u{1F949}", rank: "\u09AC\u09CD\u09B0\u09CB\u099E\u09CD\u099C \u09B2\u09BF\u09A1\u09BE\u09B0", amount: 300, reqL1: 3, reqL2: 0, reqL3: 0, enabled: true },
    { id: "t2", icon: "\u{1F948}", rank: "\u09B8\u09BF\u09B2\u09AD\u09BE\u09B0 \u09B2\u09BF\u09A1\u09BE\u09B0", amount: 700, reqL1: 5, reqL2: 0, reqL3: 0, enabled: true },
    { id: "t3", icon: "\u{1F947}", rank: "\u0997\u09CB\u09B2\u09CD\u09A1 \u09B2\u09BF\u09A1\u09BE\u09B0", amount: 1200, reqL1: 7, reqL2: 3, reqL3: 0, enabled: true },
    { id: "t4", icon: "\u{1F48E}", rank: "\u09AA\u09CD\u09B2\u09BE\u099F\u09BF\u09A8\u09BE\u09AE \u09B2\u09BF\u09A1\u09BE\u09B0", amount: 2500, reqL1: 10, reqL2: 5, reqL3: 0, enabled: true },
    { id: "t5", icon: "\u{1F451}", rank: "\u09A1\u09BE\u09AF\u09BC\u09AE\u09A8\u09CD\u09A1 \u09B2\u09BF\u09A1\u09BE\u09B0", amount: 5e3, reqL1: 15, reqL2: 10, reqL3: 5, enabled: true },
    { id: "t6", icon: "\u2B50", rank: "\u0995\u09CD\u09B0\u09BE\u0989\u09A8 \u09A1\u09BF\u09B0\u09C7\u0995\u09CD\u099F\u09B0", amount: 1e4, reqL1: 30, reqL2: 20, reqL3: 10, enabled: true },
    { id: "t7", icon: "\u{1F680}", rank: "\u098F\u09AE\u09CD\u09AC\u09BE\u09B8\u09C7\u09A1\u09B0", amount: 25e3, reqL1: 60, reqL2: 40, reqL3: 20, enabled: true },
    { id: "t8", icon: "\u{1F3DB}\uFE0F", rank: "\u09AA\u09CD\u09B0\u09C7\u09B8\u09BF\u09A1\u09C7\u09A8\u09CD\u09B8\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B2\u09BF\u09A1\u09BE\u09B0", amount: 5e4, reqL1: 120, reqL2: 80, reqL3: 50, enabled: true }
  ] }
};
var json6 = /* @__PURE__ */ __name((value, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } }), "json");
var onRequest3 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  const session = sid && await env2.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid, Date.now()).first();
  if (session?.role !== "admin") return json6({ error: "Not found" }, 404);
  try {
    if (request.method === "GET") {
      const row = await env2.DB.prepare("SELECT config_json FROM referral_settings WHERE id=1").first();
      const config3 = row ? JSON.parse(row.config_json) : defaults;
      if (!row) await env2.DB.prepare("INSERT INTO referral_settings (id,config_json,updated_at) VALUES (1,?,?)").bind(JSON.stringify(config3), Date.now()).run();
      const requests = await env2.DB.prepare(`SELECT r.id,r.user_id AS userId,u.phone AS mobile,u.id AS memberId,COALESCE(u.vip_level,0) AS vipLevel,r.tier_id AS tierId,r.amount,r.team_l1 AS teamL1,r.team_l2 AS teamL2,r.team_l3 AS teamL3,r.cycle_key AS cycleKey,r.status,r.review_note AS reviewNote,r.created_at AS createdAt,r.reviewed_at AS reviewedAt FROM salary_requests r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC`).all();
      return json6({ config: config3, requests: requests.results.map((r) => {
        const tier = config3.salary.tiers.find((t) => t.id === r.tierId);
        return { ...r, ...tier ?? { icon: "\u2B50", rank: r.tierId, reqL1: 0, reqL2: 0, reqL3: 0 }, requestedAt: new Date(r.createdAt).toISOString(), reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : void 0 };
      }) });
    }
    if (request.method === "PATCH") {
      const body = await request.json();
      if (!body.id || !["approved", "rejected"].includes(body.status ?? "")) return json6({ error: "Invalid review" }, 400);
      const row = await env2.DB.prepare("SELECT id,user_id,amount,cycle_key FROM salary_requests WHERE id=? AND status='pending'").bind(body.id).first();
      if (!row) return json6({ error: "Pending request not found" }, 404);
      if (body.status === "approved") {
        const duplicate = await env2.DB.prepare("SELECT id FROM salary_requests WHERE user_id=? AND cycle_key=? AND status='approved'").bind(row.user_id, row.cycle_key).first();
        if (duplicate) return json6({ error: "Salary already paid this cycle" }, 409);
        const reviewedAt = Date.now();
        const result = await env2.DB.prepare("UPDATE salary_requests SET status='approved',reviewed_at=? WHERE id=? AND status='pending'").bind(reviewedAt, row.id).run();
        if (!result.meta.changes) return json6({ error: "Request already reviewed" }, 409);
        await env2.DB.batch([
          env2.DB.prepare("UPDATE users SET balance=balance+? WHERE id=?").bind(row.amount, row.user_id),
          env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) VALUES (?,?,'credit',?,'Team salary',?)").bind(crypto.randomUUID(), row.user_id, row.amount, reviewedAt)
        ]);
      } else await env2.DB.prepare("UPDATE salary_requests SET status='rejected',review_note=?,reviewed_at=? WHERE id=? AND status='pending'").bind((body.note ?? "").slice(0, 500), Date.now(), row.id).run();
      return json6({ success: true });
    }
    if (request.method !== "PUT") return json6({ error: "Method not allowed" }, 405);
    const config2 = await request.json();
    if (!config2 || !config2.general || !config2.commissions || !Array.isArray(config2.commissions.levels) || !config2.salary || !Array.isArray(config2.salary.tiers) || JSON.stringify(config2).length > 1e5) return json6({ error: "Invalid referral configuration" }, 400);
    if (!config2.commissions.levels.every((level) => Number.isInteger(level.level) && level.level >= 1 && level.level <= 3 && Number.isFinite(level.depositBonus) && level.depositBonus >= 0 && level.depositBonus <= 100 && Number.isFinite(level.profitCommission) && level.profitCommission >= 0 && level.profitCommission <= 100)) return json6({ error: "Invalid commission rates" }, 400);
    if (!config2.salary.tiers.every((tier) => typeof tier.id === "string" && tier.id.length <= 80 && typeof tier.rank === "string" && tier.rank.trim() && Number.isInteger(tier.amount) && tier.amount > 0 && ["reqL1", "reqL2", "reqL3"].every((key) => Number.isInteger(tier[key]) && tier[key] >= 0))) return json6({ error: "Invalid salary tier" }, 400);
    await env2.DB.prepare("INSERT INTO referral_settings (id,config_json,updated_at) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET config_json=excluded.config_json,updated_at=excluded.updated_at").bind(JSON.stringify(config2), Date.now()).run();
    return json6({ success: true });
  } catch (error3) {
    console.error(error3);
    return json6({ error: "Referral settings unavailable" }, 500);
  }
}, "onRequest");

// api/admin/withdrawals.ts
var json7 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
async function admin2(request, DB) {
  const sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sid) return false;
  const row = await DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid, Date.now()).first();
  return row?.role === "admin";
}
__name(admin2, "admin");
var onRequest4 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  if (!await admin2(request, env2.DB)) return json7({ error: "Not found" }, 404);
  try {
    if (request.method === "GET") {
      const [rows, settings] = await Promise.all([env2.DB.prepare("SELECT x.id,x.amount,x.fee,x.net,x.status,x.created_at,x.reviewed_at,u.id AS user_id,u.name,u.phone,u.email,u.balance,w.provider,w.account FROM withdrawals x JOIN users u ON u.id=x.user_id JOIN withdrawal_wallets w ON w.id=x.wallet_id ORDER BY x.created_at DESC").all(), env2.DB.prepare("SELECT minimum_amount,fee_percent FROM withdrawal_settings WHERE id=1").first()]);
      return json7({ withdrawals: rows.results, settings });
    }
    if (request.method !== "POST") return json7({ error: "Method not allowed" }, 405);
    const body = await request.json();
    if (body.action === "settings") {
      if (!Number.isSafeInteger(body.minimumAmount) || body.minimumAmount < 1 || typeof body.feePercent !== "number" || !Number.isFinite(body.feePercent) || body.feePercent < 0 || body.feePercent > 100) return json7({ error: "Invalid withdrawal settings" }, 400);
      await env2.DB.prepare("UPDATE withdrawal_settings SET minimum_amount=?,fee_percent=?,updated_at=? WHERE id=1").bind(body.minimumAmount, body.feePercent, Date.now()).run();
      return json7({ success: true });
    }
    if (!body.id || !["approve", "reject"].includes(body.action || "")) return json7({ error: "Invalid request" }, 400);
    const row = await env2.DB.prepare("SELECT user_id,amount,status FROM withdrawals WHERE id=?").bind(body.id).first();
    if (!row) return json7({ error: "Withdrawal not found" }, 404);
    if (row.status !== "pending") return json7({ error: "Already reviewed" }, 409);
    const now = Date.now(), decision = body.action === "approve" ? "approved" : "rejected", sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1] ?? "";
    const actor = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sid, now).first();
    await env2.DB.batch([env2.DB.prepare("UPDATE withdrawals SET status=?,reviewed_at=?,reviewed_by=? WHERE id=? AND status='pending'").bind(decision, now, actor?.user_id ?? null, body.id), ...decision === "rejected" ? [env2.DB.prepare("UPDATE users SET balance=balance+? WHERE id=? AND changes()>0").bind(row.amount, row.user_id), env2.DB.prepare("INSERT INTO transactions(id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'\u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u09AB\u09C7\u09B0\u09A4',? WHERE changes()>0").bind(crypto.randomUUID(), row.user_id, row.amount, now)] : []]);
    const updated = await env2.DB.prepare("SELECT status FROM withdrawals WHERE id=?").bind(body.id).first();
    return updated?.status === decision ? json7({ success: true, status: decision }) : json7({ error: "Review conflict" }, 409);
  } catch (error3) {
    console.error("Admin withdrawals:", error3);
    return json7({ error: "Withdrawal review failed" }, 500);
  }
}, "onRequest");

// api/package-images/[id].ts
var onRequestGet4 = /* @__PURE__ */ __name(async ({ params, env: env2 }) => {
  const id = String(params.id || "");
  const row = await env2.DB.prepare("SELECT image_key FROM packages WHERE id=?").bind(id).first();
  if (!row?.image_key) return new Response("Not found", { status: 404 });
  const object = await env2.PACKAGE_IMAGES.get(row.image_key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}, "onRequestGet");

// api/apk-download.ts
var onRequestGet5 = /* @__PURE__ */ __name(async ({ env: env2 }) => {
  try {
    const row = await env2.DB.prepare("SELECT apk_download_url FROM site_settings WHERE id=1").first();
    if (!row?.apk_download_url) return new Response("APK is not configured", { status: 404 });
    const url = new URL(row.apk_download_url);
    if (url.protocol !== "https:") return new Response("Invalid APK URL", { status: 502 });
    const file = await fetch(url);
    if (!file.ok || !file.body) return new Response("APK download unavailable", { status: 502 });
    return new Response(file.body, { headers: { "Content-Type": "application/vnd.android.package-archive", "Content-Disposition": 'attachment; filename="app.apk"', "Cache-Control": "no-store" } });
  } catch (error3) {
    console.error("APK download failed:", error3);
    return new Response("APK download unavailable", { status: 502 });
  }
}, "onRequestGet");

// api/dashboard.ts
var onRequestGet6 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sid) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sid, Date.now()).first();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const [user, packageRow, tx, deposited, withdrawn] = await Promise.all([
      env2.DB.prepare("SELECT id,name,balance FROM users WHERE id=?").bind(session.user_id).first(),
      env2.DB.prepare("SELECT up.id,up.package_id AS packageId,p.name,up.price_paid AS amount,up.daily_profit AS dailyProfit,up.duration_days AS durationDays,up.started_at AS startedAt,up.expires_at AS expiresAt FROM user_packages up JOIN packages p ON p.id=up.package_id WHERE up.user_id=? AND up.status='active' AND up.expires_at>? ORDER BY up.created_at DESC LIMIT 1").bind(session.user_id, Date.now()).first(),
      env2.DB.prepare("SELECT id,type,amount,label,created_at AS createdAt FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 30").bind(session.user_id).all(),
      env2.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=? AND type='credit' AND label NOT LIKE '%\u09B2\u09BE\u09AD%'").bind(session.user_id).first(),
      env2.DB.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=? AND type='debit' AND label LIKE '%\u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8%'").bind(session.user_id).first()
    ]);
    return Response.json({ success: true, user, investment: packageRow, transactions: tx.results, totalDeposited: deposited?.total ?? 0, totalWithdrawn: withdrawn?.total ?? 0 });
  } catch (error3) {
    console.error(error3);
    return Response.json({ error: "Dashboard unavailable" }, { status: 500 });
  }
}, "onRequestGet");

// ../lib/initial-packages.ts
var INITIAL_PACKAGES = [
  { id: "vip0", name: "\u09AA\u09CD\u09B0\u09BE\u09B0\u09AE\u09CD\u09AD\u09BF\u0995 \u099C\u09B2\u09A7\u09BE\u09B0\u09BE", shortDescription: "\u09B8\u09CD\u09AC\u09B2\u09CD\u09AA\u09AE\u09C7\u09DF\u09BE\u09A6\u09C0 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u09AE\u09C2\u09B2\u0995 \u09B2\u09BF\u099C\u09BF\u0982", modelNo: "ISO-T11-20FT", tankOverview: "\u0986\u09A8\u09CD\u09A4\u09B0\u09CD\u099C\u09BE\u09A4\u09BF\u0995 \u09B8\u09AE\u09C1\u09A6\u09CD\u09B0 \u0993 \u09B8\u09DC\u0995\u09AA\u09A5\u09C7 \u09A4\u09B0\u09B2 \u0993 \u09B6\u09BF\u09B2\u09CD\u09AA\u099C\u09BE\u09A4 \u09AA\u09A3\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09CD\u099F\u09C7\u0987\u09A8\u09B2\u09C7\u09B8 \u09B8\u09CD\u099F\u09BF\u09B2 \u09A8\u09BF\u09B0\u09CD\u09AE\u09BF\u09A4 \u09E8\u09E6 \u09AB\u09C1\u099F\u09C7\u09B0 \u0986\u09A6\u09B0\u09CD\u09B6 \u0986\u0987\u098F\u09B8\u0993 \u099F\u09CD\u09AF\u09BE\u0982\u0995\u0964", profitMechanism: "\u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09AD\u09BE\u09DC\u09BE\u09B0 \u0986\u09DF \u09A5\u09C7\u0995\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u0964 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7\u09C7 \u09AC\u09BF\u09A8\u09BF\u09DF\u09CB\u0997\u0995\u09C3\u09A4 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 499, dailyRate: 7.014, durationDays: 3, maxPerUser: 1, stockLimit: 0, minActiveReferrals: 0, requiresPackageId: "", allowWhileActive: false, visible: true },
  { id: "vip1", name: "\u09B8\u09C1\u09AC\u09B0\u09CD\u09A3 \u09AA\u09CD\u09B0\u09AC\u09BE\u09B9", shortDescription: "\u09A8\u09BF\u09DF\u09AE\u09BF\u09A4 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u099F\u09CD\u09AF\u09BE\u0982\u0995 \u0985\u0982\u09B6\u09C0\u09A6\u09BE\u09B0\u09BF\u09A4\u09CD\u09AC", modelNo: "ISO-T14-24KL", tankOverview: "\u09A4\u09BE\u09AA\u09AE\u09BE\u09A4\u09CD\u09B0\u09BE \u09A8\u09BF\u09DF\u09A8\u09CD\u09A4\u09CD\u09B0\u09BF\u09A4 \u09E8\u09EA,\u09E6\u09E6\u09E6 \u09B2\u09BF\u099F\u09BE\u09B0 \u09A7\u09BE\u09B0\u09A3\u0995\u09CD\u09B7\u09AE\u09A4\u09BE\u09B0 \u0986\u0987\u098F\u09B8\u0993 \u099F\u09CD\u09AF\u09BE\u0982\u0995; \u0996\u09BE\u09A6\u09CD\u09AF\u09AE\u09BE\u09A8\u09C7\u09B0 \u09A4\u09B0\u09B2 \u0993 \u09B8\u0982\u09AC\u09C7\u09A6\u09A8\u09B6\u09C0\u09B2 \u09B6\u09BF\u09B2\u09CD\u09AA \u0989\u09AA\u09BE\u09A6\u09BE\u09A8 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4\u0964", profitMechanism: "\u09E8\u09E6 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09B2\u09BF\u099C\u09BF\u0982 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09A8\u09BF\u09B0\u09CD\u09A7\u09BE\u09B0\u09BF\u09A4 \u09B9\u09BE\u09B0\u09C7 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u0964 \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7\u09C7 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 1499, dailyRate: 2.668, durationDays: 20, maxPerUser: 2, stockLimit: 0, minActiveReferrals: 0, requiresPackageId: "", allowWhileActive: false, visible: true },
  { id: "vip2", name: "\u09B0\u099C\u09A4 \u09A4\u09B0\u0999\u09CD\u0997", shortDescription: "\u09B0\u09BE\u09B8\u09BE\u09AF\u09BC\u09A8\u09BF\u0995 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7 \u09AC\u09BF\u09B6\u09C7\u09B7\u09BE\u09DF\u09BF\u09A4 \u099F\u09CD\u09AF\u09BE\u0982\u0995", modelNo: "ISO-T20-CHEM", tankOverview: "\u0989\u099A\u09CD\u099A-\u0998\u09A8\u09A4\u09CD\u09AC\u09C7\u09B0 \u09B6\u09BF\u09B2\u09CD\u09AA \u09B0\u09BE\u09B8\u09BE\u09DF\u09A8\u09BF\u0995 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09CD\u09B7\u09DF\u09B0\u09CB\u09A7\u09C0 \u09B8\u09C1\u09B0\u0995\u09CD\u09B7\u09BE \u09B8\u09CD\u09A4\u09B0\u09AC\u09BF\u09B6\u09BF\u09B7\u09CD\u099F \u09AC\u09BF\u09B6\u09C7\u09B7\u09BE\u09DF\u09BF\u09A4 \u0986\u0987\u098F\u09B8\u0993 \u099F\u09CD\u09AF\u09BE\u0982\u0995\u0964", profitMechanism: "\u09EA\u09EB \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u09AD\u09BE\u09DC\u09BE\u09B0 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09DF; \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7\u09C7 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 4499, dailyRate: 3.23, durationDays: 45, maxPerUser: 1, stockLimit: 500, minActiveReferrals: 3, requiresPackageId: "vip1", allowWhileActive: true, visible: true },
  { id: "vip3", name: "\u09A8\u09C0\u09B2 \u09A6\u09BF\u0997\u09A8\u09CD\u09A4", shortDescription: "\u0989\u099A\u09CD\u099A\u099A\u09BE\u09AA \u09A4\u09B0\u09B2 \u0997\u09CD\u09AF\u09BE\u09B8 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8 \u0987\u0989\u09A8\u09BF\u099F", modelNo: "ISO-T50-GAS", tankOverview: "\u0989\u099A\u09CD\u099A\u099A\u09BE\u09AA-\u09B8\u09B9\u09A8\u09B6\u09C0\u09B2 \u0997\u09CD\u09AF\u09BE\u09B8 \u099F\u09CD\u09AF\u09BE\u0982\u0995 \u0995\u09A8\u09CD\u099F\u09C7\u0987\u09A8\u09BE\u09B0; \u09A4\u09B0\u09B2\u09C0\u0995\u09C3\u09A4 \u099C\u09CD\u09AC\u09BE\u09B2\u09BE\u09A8\u09BF \u0993 \u09B6\u09BF\u09B2\u09CD\u09AA \u0997\u09CD\u09AF\u09BE\u09B8 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4\u0964", profitMechanism: "\u09EC\u09E6 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AC\u09BE\u09A3\u09BF\u099C\u09CD\u09AF\u09BF\u0995 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF; \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7\u09C7 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 9499, dailyRate: 3.1477, durationDays: 60, maxPerUser: 1, stockLimit: 100, minActiveReferrals: 5, requiresPackageId: "vip2", allowWhileActive: true, visible: true },
  { id: "vip4", name: "\u09AE\u09A3\u09BF\u0995\u09CB\u09A0\u09BE \u09AA\u09CD\u09B0\u09B9\u09B0", shortDescription: "\u0985\u09A4\u09BF-\u09B6\u09C0\u09A4\u09B2 \u0995\u09CD\u09B0\u09BE\u09DF\u09CB\u099C\u09C7\u09A8\u09BF\u0995 \u09AC\u09BF\u09B6\u09C7\u09B7 \u099F\u09CD\u09AF\u09BE\u0982\u0995", modelNo: "ISO-T75-CRYO", tankOverview: "\u09B6\u09C2\u09A8\u09CD\u09AF\u09B8\u09CD\u09A5\u09BE\u09A8-\u09A8\u09BF\u09B0\u09CB\u09A7\u0995 \u09A6\u09CD\u09AC\u09BF\u09B8\u09CD\u09A4\u09B0 \u09AC\u09BF\u09B6\u09BF\u09B7\u09CD\u099F \u0995\u09CD\u09B0\u09BE\u09DF\u09CB\u099C\u09C7\u09A8\u09BF\u0995 \u099F\u09CD\u09AF\u09BE\u0982\u0995; \u09A4\u09B0\u09B2\u09C0\u0995\u09C3\u09A4 \u0997\u09CD\u09AF\u09BE\u09B8 \u0993 \u099A\u09BF\u0995\u09BF\u09CE\u09B8\u09BE \u0985\u0995\u09CD\u09B8\u09BF\u099C\u09C7\u09A8 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4\u0964", profitMechanism: "\u09EC\u09E6 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AC\u09BF\u09B6\u09C7\u09B7 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09DF; \u09AE\u09C7\u09DF\u09BE\u09A6\u09BE\u09A8\u09CD\u09A4\u09C7 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 19999, dailyRate: 2.8501, durationDays: 60, maxPerUser: 1, stockLimit: 50, minActiveReferrals: 8, requiresPackageId: "vip3", allowWhileActive: true, visible: true },
  { id: "vip5", name: "\u09B8\u09AE\u09C1\u09A6\u09CD\u09B0 \u09AC\u09BF\u099C\u09DF", shortDescription: "\u09A6\u09CD\u09AC\u09C8\u09A4 \u0986\u09A8\u09CD\u09A4\u0983\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6\u09C0\u09DF \u099F\u09CD\u09AF\u09BE\u0982\u0995 \u09AC\u09B9\u09B0", modelNo: "ISO-T11-DUO-48K", tankOverview: "\u0986\u09A8\u09CD\u09A4\u0983\u09AE\u09B9\u09BE\u09A6\u09C7\u09B6\u09C0\u09DF \u09B0\u09C7\u09B2 \u0993 \u09B8\u09AE\u09C1\u09A6\u09CD\u09B0 \u0995\u09B0\u09BF\u09A1\u09CB\u09B0\u09C7 \u09AA\u09B0\u09BF\u099A\u09BE\u09B2\u09BF\u09A4 \u09A6\u09CD\u09AC\u09C8\u09A4 \u099F\u09CD\u09AF\u09BE\u0982\u0995 \u09AC\u09B9\u09B0; \u09AC\u09C3\u09B9\u09CE \u09B6\u09BF\u09B2\u09CD\u09AA\u0997\u09CB\u09B7\u09CD\u09A0\u09C0\u09B0 \u0995\u09BE\u0981\u099A\u09BE\u09AE\u09BE\u09B2 \u09AA\u09B0\u09BF\u09AC\u09B9\u09A8\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4\u0964", profitMechanism: "\u09EF\u09E6 \u09A6\u09BF\u09A8\u09C7\u09B0 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u09B2\u09BF\u099C\u09BF\u0982 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF; \u09AE\u09C7\u09DF\u09BE\u09A6 \u09B6\u09C7\u09B7\u09C7 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 29999, dailyRate: 2.7001, durationDays: 90, maxPerUser: 2, stockLimit: 20, minActiveReferrals: 10, requiresPackageId: "vip4", allowWhileActive: true, visible: true },
  { id: "vip6", name: "\u09B8\u09AA\u09CD\u09A4\u09B0\u09CD\u09B7\u09BF \u09B8\u09BE\u09AE\u09CD\u09B0\u09BE\u099C\u09CD\u09AF", shortDescription: "\u09AC\u09C8\u09B6\u09CD\u09AC\u09BF\u0995 \u09AC\u09A8\u09CD\u09A6\u09B0 \u099F\u09BE\u09B0\u09CD\u09AE\u09BF\u09A8\u09BE\u09B2 \u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u09AC\u09B9\u09B0", modelNo: "ISO-T75-GLOBAL-PRO", tankOverview: "\u09AC\u09C8\u09B6\u09CD\u09AC\u09BF\u0995 \u09B8\u09AE\u09C1\u09A6\u09CD\u09B0\u09AC\u09A8\u09CD\u09A6\u09B0 \u099F\u09BE\u09B0\u09CD\u09AE\u09BF\u09A8\u09BE\u09B2\u09C7 \u09A8\u09BF\u09DF\u09CB\u099C\u09BF\u09A4 \u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09B8\u0995\u09CD\u09B7\u09AE\u09A4\u09BE\u09B0 \u09B8\u09AE\u09A8\u09CD\u09AC\u09BF\u09A4 \u0986\u0987\u098F\u09B8\u0993 \u099F\u09CD\u09AF\u09BE\u0982\u0995 \u09AC\u09B9\u09B0\u0964", profitMechanism: "\u09E7\u09E8\u09E6 \u09A6\u09BF\u09A8\u09C7\u09B0 \u099A\u09C1\u0995\u09CD\u09A4\u09BF\u09A4\u09C7 \u09A6\u09C8\u09A8\u09BF\u0995 \u09B2\u09AD\u09CD\u09AF\u09BE\u0982\u09B6 \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09DF; \u09AE\u09C7\u09DF\u09BE\u09A6 \u09AA\u09C2\u09B0\u09CD\u09A3 \u09B9\u09B2\u09C7 \u09AE\u09C2\u09B2\u09A7\u09A8 \u09AB\u09C7\u09B0\u09A4\u09AF\u09CB\u0997\u09CD\u09AF\u0964", price: 50199, dailyRate: 2.6494, durationDays: 120, maxPerUser: 2, stockLimit: 10, minActiveReferrals: 15, requiresPackageId: "vip5", allowWhileActive: true, visible: true }
];

// api/packages.ts
var json8 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
var onRequestGet7 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  try {
    const now = Date.now();
    await env2.DB.batch(INITIAL_PACKAGES.flatMap((p) => [
      env2.DB.prepare("INSERT OR IGNORE INTO packages (id,name,short_description,model_no,tank_overview,profit_mechanism,price,daily_rate,duration_days,max_per_user,stock_limit,min_active_referrals,requires_package_id,allow_while_active,visible,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(p.id, p.name, p.shortDescription, p.modelNo, p.tankOverview, p.profitMechanism, p.price, p.dailyRate, p.durationDays, p.maxPerUser, p.stockLimit, p.minActiveReferrals, p.requiresPackageId, +p.allowWhileActive, +p.visible, now, now),
      env2.DB.prepare("UPDATE packages SET short_description=?,model_no=?,tank_overview=?,profit_mechanism=?,updated_at=? WHERE id=? AND short_description=''").bind(p.shortDescription, p.modelNo, p.tankOverview, p.profitMechanism, now, p.id)
    ]));
    try {
      const result = await env2.DB.prepare("SELECT id,name,short_description AS shortDescription,model_no AS modelNo,tank_overview AS tankOverview,profit_mechanism AS profitMechanism,price,daily_profit AS dailyProfit,duration_days AS durationDays,min_vip_level AS minVipLevel,max_per_user AS maxPerUser,visible,CASE WHEN image_key='' THEN '' ELSE '/api/package-images/'||id||'?v='||updated_at END AS imageUrl FROM packages WHERE visible = 1 ORDER BY price").all();
      const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
      const session = sessionId ? await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sessionId, now).first() : null;
      if (!session) return json8({ packages: result.results.map(({ maxPerUser, ...p }) => ({ ...p, purchaseLimit: maxPerUser, purchasedCount: 0, eligible: false, eligibilityMessage: "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u0995\u09BF\u09A8\u09A4\u09C7 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8" })) });
      const [balance, userVip] = await Promise.all([
        env2.DB.prepare("SELECT balance FROM users WHERE id=?").bind(session.user_id).first(),
        env2.DB.prepare("SELECT COALESCE(vip_level,0) AS level FROM users WHERE id=?").bind(session.user_id).first()
      ]);
      const packages = await Promise.all(result.results.map(async (p) => {
        const bought = await env2.DB.prepare("SELECT COUNT(*) AS n FROM user_packages WHERE user_id=? AND package_id=?").bind(session.user_id, p.id).first();
        let eligibilityMessage = "";
        if (balance && balance.balance < p.price) eligibilityMessage = "\u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09A8\u09C7\u0987";
        else if (p.maxPerUser && (bought?.n ?? 0) >= p.maxPerUser) eligibilityMessage = "\u0995\u09CD\u09B0\u09DF\u09C7\u09B0 \u09B8\u09C0\u09AE\u09BE \u09AA\u09C2\u09B0\u09CD\u09A3";
        else if ((userVip?.level ?? 0) < p.minVipLevel) eligibilityMessage = `\u0985\u09AD\u09BF\u099C\u09BE\u09A4 \u09A7\u09BE\u09AA ${p.minVipLevel} \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u099C\u09A8`;
        const { maxPerUser, ...publicPackage } = p;
        return { ...publicPackage, purchaseLimit: maxPerUser, purchasedCount: bought?.n ?? 0, eligible: !eligibilityMessage, eligibilityMessage };
      }));
      return json8({ packages });
    } catch {
      const result = await env2.DB.prepare("SELECT id,name,price,300 AS dailyProfit,duration_days AS durationDays,0 AS minVipLevel,visible,'' AS imageUrl FROM packages WHERE visible=1 ORDER BY price").all();
      return json8({ packages: result.results });
    }
  } catch (error3) {
    console.error(error3);
    return json8({ error: "\u09AA\u09CD\u09AF\u09BE\u0995\u09C7\u099C \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 500);
  }
}, "onRequestGet");

// api/profile.ts
async function onRequestGet8({ request, env: env2 }) {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sessionId) return Response.json({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, { status: 401 });
  try {
    const session = await env2.DB.prepare(
      "SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?"
    ).bind(sessionId, Date.now()).first();
    if (!session) return Response.json({ error: "\u09B8\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09B6\u09C7\u09B7" }, { status: 401 });
    const user = await env2.DB.prepare(
      "SELECT name, email, phone, balance, vip_level, gender, uid FROM users WHERE id = ?"
    ).bind(session.user_id).first();
    if (!user) return Response.json({ error: "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, { status: 404 });
    const dayStart = new Date(Date.now() + 6 * 60 * 60 * 1e3);
    dayStart.setUTCHours(0, 0, 0, 0);
    dayStart.setTime(dayStart.getTime() - 6 * 60 * 60 * 1e3);
    const [storedStats, packageStats] = await Promise.all([
      env2.DB.prepare("SELECT team_received, team_dividend, total_withdraw FROM user_stats WHERE user_id = ?").bind(session.user_id).first(),
      env2.DB.prepare("SELECT COALESCE((SELECT SUM(amount) FROM daily_profits WHERE user_id=?),0) AS work_earnings, COALESCE((SELECT SUM(price_paid) FROM user_packages WHERE user_id=?),0) AS total_deposit, COALESCE((SELECT SUM(amount) FROM daily_profits WHERE user_id=? AND credited_at>=?),0) AS today_earnings").bind(session.user_id, session.user_id, session.user_id, dayStart.getTime()).first()
    ]);
    const stats = {
      work_earnings: packageStats?.work_earnings ?? 0,
      total_deposit: packageStats?.total_deposit ?? 0,
      team_received: storedStats?.team_received ?? 0,
      team_dividend: storedStats?.team_dividend ?? 0,
      today_earnings: packageStats?.today_earnings ?? 0,
      total_withdraw: storedStats?.total_withdraw ?? 0
    };
    return Response.json({ success: true, user, stats });
  } catch (error3) {
    console.error("Profile fetch error:", error3);
    return Response.json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, { status: 500 });
  }
}
__name(onRequestGet8, "onRequestGet");

// api/referrals.ts
async function onRequestGet9({ request, env: env2 }) {
  const token = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!token) return Response.json({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, { status: 401 });
  try {
    const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?").bind(token, Date.now()).first();
    if (!session) return Response.json({ error: "\u09B8\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09B6\u09C7\u09B7" }, { status: 401 });
    const configRow = await env2.DB.prepare("SELECT config_json FROM referral_settings WHERE id=1").first();
    const config2 = configRow ? JSON.parse(configRow.config_json) : null;
    const activeWhen = config2?.general?.activeWhen ?? "min_vip";
    const activeTest = activeWhen === "any_package" ? "EXISTS(SELECT 1 FROM user_packages p WHERE p.user_id=tree.id)" : activeWhen === "min_deposit" ? "COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=tree.id),0)>=?" : "COALESCE((SELECT vip_level FROM users WHERE id=tree.id),0)>=?";
    const activeBind = activeWhen === "min_deposit" ? [config2?.general?.activeMinDeposit ?? 500] : activeWhen === "min_vip" ? [config2?.general?.activeMinVip ?? 1] : [];
    const [user, members, earnings] = await Promise.all([
      env2.DB.prepare("SELECT referral_code FROM users WHERE id = ?").bind(session.user_id).first(),
      env2.DB.prepare(`WITH RECURSIVE tree(id,depth) AS (SELECT id,1 FROM users WHERE referred_by=? UNION ALL SELECT u.id,t.depth+1 FROM users u JOIN tree t ON u.referred_by=t.id WHERE t.depth<3) SELECT COUNT(*) members,SUM(CASE WHEN ${activeTest} THEN 1 ELSE 0 END) active FROM tree`).bind(session.user_id, ...activeBind).first(),
      env2.DB.prepare("SELECT team_received, team_dividend FROM user_stats WHERE user_id = ?").bind(session.user_id).first()
    ]);
    if (!user?.referral_code) return Response.json({ error: "\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u0995\u09CB\u09A1 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, { status: 404 });
    return Response.json({ referralCode: user.referral_code, members: members?.members ?? 0, active: members?.active ?? 0, depositBonus: earnings?.team_received ?? 0, profitCommission: earnings?.team_dividend ?? 0, rates: config2?.commissions?.levels ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error3) {
    console.error("Referral fetch error:", error3);
    return Response.json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, { status: 500 });
  }
}
__name(onRequestGet9, "onRequestGet");

// api/send-code.ts
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
__name(validateEmail, "validateEmail");
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
__name(normalizeEmail, "normalizeEmail");
function generateOTP() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
__name(generateOTP, "generateOTP");
async function hashOTP(code, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + secret);
  const hash3 = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash3)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashOTP, "hashOTP");
async function checkCooldown(db, email) {
  const result = await db.prepare(
    "SELECT created_at FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(email).first();
  if (!result) return { allowed: true };
  const timeSince = Date.now() - result.created_at;
  const cooldownMs = 6e4;
  if (timeSince < cooldownMs) {
    return { allowed: false, error: `\u0986\u09B0\u0993 ${Math.ceil((cooldownMs - timeSince) / 1e3)} \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09C1\u09A8` };
  }
  return { allowed: true };
}
__name(checkCooldown, "checkCooldown");
async function sendOTPEmail(apiKey, email, code) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Bridge Wallet <no-reply@rakibulhasan.live>",
      to: email,
      subject: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u0995\u09CB\u09A1 - \u09AC\u09B0\u099C\u09BE\u099C",
      html: `
        <div style="font-family: 'Noto Serif Bengali', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0875ec; margin-bottom: 20px;">\u09AC\u09B0\u099C\u09BE\u099C \u0993\u09AF\u09BC\u09BE\u09B2\u09C7\u099F</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">\u0986\u09AA\u09A8\u09BE\u09B0 \u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u0995\u09CB\u09A1:</p>
          <div style="background: #f0f9ff; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="font-size: 42px; letter-spacing: 12px; margin: 0; color: #0875ec;">${code}</h1>
          </div>
          <p style="font-size: 14px; margin-bottom: 10px;">\u098F\u0987 \u0995\u09CB\u09A1\u099F\u09BF <strong>\u09E7\u09E6 \u09AE\u09BF\u09A8\u09BF\u099F\u09C7\u09B0</strong> \u099C\u09A8\u09CD\u09AF \u09AC\u09C8\u09A7\u0964</p>
          <p style="color: #666; font-size: 13px;">\u09AF\u09A6\u09BF \u0986\u09AA\u09A8\u09BF \u098F\u0987 \u0995\u09CB\u09A1\u099F\u09BF \u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u09A8\u09BE \u0995\u09B0\u09C7 \u09A5\u09BE\u0995\u09C7\u09A8, \u09A4\u09BE\u09B9\u09B2\u09C7 \u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2\u099F\u09BF \u0989\u09AA\u09C7\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09C1\u09A8\u0964</p>
        </div>
      `
    })
  });
  if (!response.ok) {
    const error3 = await response.text();
    console.error("Resend error:", error3);
    throw new Error("\u0987\u09AE\u09C7\u0987\u09B2 \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5");
  }
}
__name(sendOTPEmail, "sendOTPEmail");
async function onRequestPost8(context2) {
  const { request, env: env2 } = context2;
  try {
    const body = await request.json();
    const { email } = body;
    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: "\u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09A6\u09BF\u09A8" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailLower = normalizeEmail(email);
    const existing = await env2.DB.prepare(
      "SELECT email FROM users WHERE email = ?"
    ).bind(emailLower).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const cooldown = await checkCooldown(env2.DB, emailLower);
    if (!cooldown.allowed) {
      return new Response(JSON.stringify({ error: cooldown.error }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    const code = generateOTP();
    const secret = env2.RESEND_API_KEY.slice(0, 16);
    const codeHash = await hashOTP(code, secret);
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    const otpId = crypto.randomUUID();
    await env2.DB.prepare(
      "INSERT INTO email_otps (id, email, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(otpId, emailLower, codeHash, expiresAt, Date.now()).run();
    await env2.DB.prepare(
      "DELETE FROM email_otps WHERE expires_at < ?"
    ).bind(Date.now()).run();
    await sendOTPEmail(env2.RESEND_API_KEY, emailLower, code);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Send code error:", error3);
    return new Response(JSON.stringify({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost8, "onRequestPost");

// api/signup.ts
function validateEmail2(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
__name(validateEmail2, "validateEmail");
function normalizeEmail2(email) {
  return email.trim().toLowerCase();
}
__name(normalizeEmail2, "normalizeEmail");
function validatePhone(phone) {
  return /^0?1\d{9}$/.test(phone.replace(/\s/g, ""));
}
__name(validatePhone, "validatePhone");
async function hashPassword2(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash3 = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash3)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword2, "hashPassword");
async function hashOTP2(code, secret) {
  return hashPassword2(code + secret);
}
__name(hashOTP2, "hashOTP");
async function onRequestPost9(context2) {
  const { request, env: env2 } = context2;
  try {
    const body = await request.json();
    const { name, phone, email, password } = body;
    const code = String(body.code ?? body.otp ?? "").replace(/[০-৯]/g, (digit) => String("\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF".indexOf(digit)));
    const referralCode = body.referralCode ?? body.invite;
    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: "\u09A8\u09BE\u09AE \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09E8 \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!validatePhone(phone)) {
      return new Response(JSON.stringify({ error: "\u09B8\u09A0\u09BF\u0995 \u09AB\u09CB\u09A8 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!validateEmail2(email)) {
      return new Response(JSON.stringify({ error: "\u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09A6\u09BF\u09A8" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: "\u09B8\u09A0\u09BF\u0995 \u09EC \u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09B0 \u0995\u09CB\u09A1 \u09A6\u09BF\u09A8" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailLower = normalizeEmail2(email);
    const secret = env2.RESEND_API_KEY.slice(0, 16);
    const codeHash = await hashOTP2(code, secret);
    const otpRecord = await env2.DB.prepare(
      "SELECT expires_at FROM email_otps WHERE email = ? AND code_hash = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(emailLower, codeHash).first();
    if (!otpRecord) {
      return new Response(JSON.stringify({ error: "\u09AD\u09C1\u09B2 \u09AF\u09BE\u099A\u09BE\u0987\u0995\u09B0\u09A3 \u0995\u09CB\u09A1" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (Date.now() > otpRecord.expires_at) {
      return new Response(JSON.stringify({ error: "\u0995\u09CB\u09A1\u09C7\u09B0 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09B6\u09C7\u09B7 \u09B9\u09AF\u09BC\u09C7 \u0997\u09C7\u099B\u09C7" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existing = await env2.DB.prepare(
      "SELECT email FROM users WHERE email = ?"
    ).bind(emailLower).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "\u098F\u0987 \u0987\u09AE\u09C7\u0987\u09B2 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let referrerId = null;
    if (referralCode && referralCode.trim()) {
      const referrer = await env2.DB.prepare(
        "SELECT id FROM users WHERE referral_code = ?"
      ).bind(referralCode.trim()).first();
      if (!referrer) {
        return new Response(JSON.stringify({ error: "\u09B0\u09C7\u09AB\u09BE\u09B0\u09C7\u09B2 \u0995\u09CB\u09A1 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      referrerId = referrer.id;
    }
    const userId2 = crypto.randomUUID();
    const userReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const passwordHash = await hashPassword2(password);
    await env2.DB.prepare(`
      INSERT INTO users (id, email, name, phone, password_hash, referral_code, referred_by, balance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId2,
      emailLower,
      name,
      phone,
      passwordHash,
      userReferralCode,
      referrerId,
      0,
      Date.now()
    ).run();
    await env2.DB.prepare(
      "DELETE FROM email_otps WHERE email = ?"
    ).bind(emailLower).run();
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: userId2,
        email: emailLower,
        name,
        referralCode: userReferralCode
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Signup error:", error3);
    return new Response(JSON.stringify({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost9, "onRequestPost");

// api/withdrawal-password.ts
var json9 = /* @__PURE__ */ __name((body, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } }), "json");
var hash = /* @__PURE__ */ __name(async (password) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)))).map((byte) => byte.toString(16).padStart(2, "0")).join(""), "hash");
async function getUserId(request, env2) {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sessionId) return null;
  return (await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sessionId, Date.now()).first())?.user_id ?? null;
}
__name(getUserId, "getUserId");
var onRequestGet10 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  try {
    const userId2 = await getUserId(request, env2);
    if (!userId2) return json9({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, 401);
    const user = await env2.DB.prepare("SELECT withdrawal_password_hash FROM users WHERE id=?").bind(userId2).first();
    if (!user) return json9({ error: "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 404);
    return json9({ success: true, hasPassword: Boolean(user.withdrawal_password_hash) });
  } catch (error3) {
    console.error("Withdrawal password status failed", error3);
    return json9({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, 500);
  }
}, "onRequestGet");
var onRequestPost10 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  try {
    const userId2 = await getUserId(request, env2);
    if (!userId2) return json9({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, 401);
    const body = await request.json();
    if (typeof body.password !== "string" || typeof body.confirmPassword !== "string" || body.password.length < 6) return json9({ error: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u0995\u09AE\u09AA\u0995\u09CD\u09B7\u09C7 \u09EC \u0985\u0995\u09CD\u09B7\u09B0\u09C7\u09B0 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7" }, 400);
    if (body.password !== body.confirmPassword) return json9({ error: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE" }, 400);
    const user = await env2.DB.prepare("SELECT withdrawal_password_hash FROM users WHERE id=?").bind(userId2).first();
    if (!user) return json9({ error: "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 404);
    if (user.withdrawal_password_hash) {
      if (typeof body.currentPassword !== "string" || await hash(body.currentPassword) !== user.withdrawal_password_hash) return json9({ error: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC" }, 400);
      const result = await env2.DB.prepare("UPDATE users SET withdrawal_password_hash=? WHERE id=? AND withdrawal_password_hash=?").bind(await hash(body.password), userId2, user.withdrawal_password_hash).run();
      if (!result.meta.changes) return json9({ error: "\u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7; \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8" }, 409);
    } else {
      const result = await env2.DB.prepare("UPDATE users SET withdrawal_password_hash=? WHERE id=? AND withdrawal_password_hash IS NULL").bind(await hash(body.password), userId2).run();
      if (!result.meta.changes) return json9({ error: "\u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09B8\u09C7\u099F \u09B9\u09AF\u09BC\u09C7\u099B\u09C7; \u0986\u09AC\u09BE\u09B0 \u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8" }, 409);
    }
    return json9({ success: true });
  } catch (error3) {
    console.error("Withdrawal password update failed", error3);
    return json9({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, 500);
  }
}, "onRequestPost");

// api/work.ts
var onRequestGet11 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const id = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const session = await env2.DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(id, Date.now()).first();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const now = Date.now();
    const [packages, profits] = await Promise.all([
      env2.DB.prepare("SELECT up.id,up.package_id AS packageId,p.name,up.price_paid AS amount,up.daily_profit AS dailyProfit,up.duration_days AS durationDays,up.started_at AS startedAt,up.expires_at AS expiresAt,up.status FROM user_packages up JOIN packages p ON p.id=up.package_id WHERE up.user_id=? ORDER BY up.created_at DESC").bind(session.user_id).all(),
      env2.DB.prepare("SELECT dp.id,dp.user_package_id AS userPackageId,dp.package_id AS packageId,p.name,dp.day_number AS day,dp.amount,dp.credited_at AS createdAt FROM daily_profits dp LEFT JOIN packages p ON p.id=dp.package_id WHERE dp.user_id=? ORDER BY dp.credited_at DESC LIMIT 500").bind(session.user_id).all()
    ]);
    return Response.json({ success: true, packages: packages.results, profits: profits.results, now });
  } catch (error3) {
    console.error(error3);
    return Response.json({ error: "Work data unavailable" }, { status: 500 });
  }
}, "onRequestGet");

// api/site-settings.ts
var json10 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
var fields = ["telegramChannelUrl", "telegramSupportUrl", "whatsappSupportUrl", "apkDownloadUrl"];
var onRequest5 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  try {
    if (request.method === "GET") {
      const row = await env2.DB.prepare("SELECT telegram_channel_url AS telegramChannelUrl,telegram_support_url AS telegramSupportUrl,whatsapp_support_url AS whatsappSupportUrl,apk_download_url AS apkDownloadUrl FROM site_settings WHERE id=1").first();
      return json10(row ?? { telegramChannelUrl: "", telegramSupportUrl: "", whatsappSupportUrl: "", apkDownloadUrl: "" });
    }
    if (request.method !== "PUT") return json10({ error: "Method not allowed" }, 405);
    const sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
    const session = sid && await env2.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid, Date.now()).first();
    if (session?.role !== "admin") return json10({ error: "Not found" }, 404);
    const body = await request.json();
    if (!fields.every((key) => typeof body[key] === "string" && body[key].length <= 2048 && (!body[key] || (() => {
      try {
        return new URL(body[key]).protocol === "https:";
      } catch {
        return false;
      }
    })()))) return json10({ error: "Enter valid HTTPS links" }, 400);
    await env2.DB.prepare("UPDATE site_settings SET telegram_channel_url=?,telegram_support_url=?,whatsapp_support_url=?,apk_download_url=?,updated_at=? WHERE id=1").bind(...fields.map((key) => body[key]), Date.now()).run();
    return json10({ success: true });
  } catch (error3) {
    console.error("Site settings error:", error3);
    return json10({ error: "Settings unavailable" }, 500);
  }
}, "onRequest");

// api/team.ts
var json11 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
async function sessionUser(request, DB) {
  const sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  if (!sid) return null;
  return DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sid, Date.now()).first();
}
__name(sessionUser, "sessionUser");
var onRequest6 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  const session = await sessionUser(request, env2.DB);
  if (!session) return json11({ error: "Unauthorized" }, 401);
  try {
    const configRow = await env2.DB.prepare("SELECT config_json FROM referral_settings WHERE id=1").first();
    const config2 = configRow ? JSON.parse(configRow.config_json) : null;
    const activeWhen = config2?.general?.activeWhen ?? "min_vip";
    const activeVip = Number(config2?.general?.activeMinVip ?? 1);
    const activeDeposit = Number(config2?.general?.activeMinDeposit ?? 500);
    const isActive = activeWhen === "any_package" ? "EXISTS(SELECT 1 FROM user_packages p WHERE p.user_id=u.id)" : activeWhen === "min_deposit" ? "COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=u.id),0)>=?" : "COALESCE(u.vip_level,0)>=?";
    if (request.method === "GET") {
      const [members, earnings, user, requests] = await Promise.all([
        env2.DB.prepare(`WITH RECURSIVE tree(id,depth) AS (
          SELECT id,1 FROM users WHERE referred_by=?
          UNION ALL SELECT u.id,t.depth+1 FROM users u JOIN tree t ON u.referred_by=t.id WHERE t.depth<3
        ) SELECT t.depth AS level,u.id,u.name,u.phone,u.created_at AS joinedAt,u.balance,u.vip_level AS vipLevel,
          CASE WHEN ${isActive} THEN 1 ELSE 0 END AS active,
          COALESCE((SELECT SUM(price_paid) FROM user_packages p WHERE p.user_id=u.id),0) AS deposit,
          COALESCE((SELECT SUM(amount) FROM daily_profits p WHERE p.user_id=u.id),0) AS profit
          FROM tree t JOIN users u ON u.id=t.id ORDER BY t.depth,u.created_at DESC`).bind(...activeWhen === "min_deposit" ? [session.user_id, activeDeposit] : activeWhen === "min_vip" ? [session.user_id, activeVip] : [session.user_id]).all(),
        env2.DB.prepare("SELECT team_received,team_dividend FROM user_stats WHERE user_id=?").bind(session.user_id).first(),
        env2.DB.prepare("SELECT referral_code FROM users WHERE id=?").bind(session.user_id).first(),
        env2.DB.prepare("SELECT tier_id AS tierId,amount,status,cycle_key AS cycleKey,created_at AS createdAt FROM salary_requests WHERE user_id=? ORDER BY created_at DESC").bind(session.user_id).all()
      ]);
      const list = members.results ?? [];
      return json11({ config: config2, referralCode: user?.referral_code, members: list, counts: [1, 2, 3].map((level) => list.filter((m) => m.level === level).length), earnings, requests: requests.results });
    }
    if (request.method !== "POST") return json11({ error: "Method not allowed" }, 405);
    if (!config2?.general?.enabled || !config2?.salary?.enabled) return json11({ error: "Salary unavailable" }, 400);
    const body = await request.json();
    const tier = config2.salary.tiers.find((t) => t.id === body.tierId && t.enabled);
    if (!tier) return json11({ error: "Invalid salary tier" }, 400);
    const counts = await env2.DB.prepare(`WITH RECURSIVE tree(id,depth) AS (
      SELECT id,1 FROM users WHERE referred_by=? UNION ALL SELECT u.id,t.depth+1 FROM users u JOIN tree t ON u.referred_by=t.id WHERE t.depth<3
    ) SELECT t.depth AS level,COUNT(*) AS n FROM tree t JOIN users u ON u.id=t.id GROUP BY t.depth`).bind(session.user_id).all();
    const team = [1, 2, 3].map((level) => counts.results?.find((x) => x.level === level)?.n ?? 0);
    if (team[0] < tier.reqL1 || team[1] < tier.reqL2 || team[2] < tier.reqL3) return json11({ error: "Salary requirements not met" }, 400);
    const now = Date.now(), cycle = config2.salary.cycle === "weekly" ? `w${Math.floor(now / 6048e5)}` : new Date(now).toISOString().slice(0, 7);
    const existing = await env2.DB.prepare("SELECT id FROM salary_requests WHERE user_id=? AND cycle_key=? AND status IN ('pending','approved')").bind(session.user_id, cycle).first();
    if (existing) return json11({ error: "One salary tier per cycle" }, 409);
    const id = crypto.randomUUID();
    await env2.DB.prepare("INSERT INTO salary_requests (id,user_id,tier_id,amount,cycle_key,team_l1,team_l2,team_l3,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id, session.user_id, tier.id, tier.amount, cycle, ...team, config2.salary.needsApproval ? "pending" : "approved", now).run();
    if (!config2.salary.needsApproval) await env2.DB.batch([
      env2.DB.prepare("UPDATE users SET balance=balance+? WHERE id=?").bind(tier.amount, session.user_id),
      env2.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) VALUES (?,?,'credit',?,'Team salary',?)").bind(crypto.randomUUID(), session.user_id, tier.amount, now)
    ]);
    return json11({ success: true, id, status: config2.salary.needsApproval ? "pending" : "approved" });
  } catch (error3) {
    console.error("Team API:", error3);
    return json11({ error: "Team data unavailable" }, 500);
  }
}, "onRequest");

// api/withdrawals.ts
var json12 = /* @__PURE__ */ __name((data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } }), "json");
async function userId(request, DB) {
  const sid = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  return sid ? (await DB.prepare("SELECT user_id FROM sessions WHERE id=? AND expires_at>?").bind(sid, Date.now()).first())?.user_id : null;
}
__name(userId, "userId");
var hash2 = /* @__PURE__ */ __name(async (value) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))).map((x) => x.toString(16).padStart(2, "0")).join(""), "hash");
var onRequest7 = /* @__PURE__ */ __name(async ({ request, env: env2 }) => {
  try {
    const uid = await userId(request, env2.DB);
    if (!uid) return json12({ error: "\u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A8\u09AF\u09BC" }, 401);
    if (request.method === "GET") {
      const [wallets, withdrawals, user2, settings] = await Promise.all([
        env2.DB.prepare("SELECT id,provider,account FROM withdrawal_wallets WHERE user_id=? ORDER BY created_at").bind(uid).all(),
        env2.DB.prepare("SELECT x.id,x.amount,x.fee,x.net,x.status,x.created_at AS date,w.provider,w.account FROM withdrawals x JOIN withdrawal_wallets w ON w.id=x.wallet_id WHERE x.user_id=? ORDER BY x.created_at DESC LIMIT 50").bind(uid).all(),
        env2.DB.prepare("SELECT balance,withdrawal_password_hash FROM users WHERE id=?").bind(uid).first(),
        env2.DB.prepare("SELECT minimum_amount,fee_percent FROM withdrawal_settings WHERE id=1").first()
      ]);
      return json12({ wallets: wallets.results, withdrawals: withdrawals.results, balance: user2?.balance ?? 0, hasPassword: !!user2?.withdrawal_password_hash, settings });
    }
    if (request.method !== "POST") return json12({ error: "Method not allowed" }, 405);
    const body = await request.json();
    const user = await env2.DB.prepare("SELECT balance,withdrawal_password_hash FROM users WHERE id=?").bind(uid).first();
    if (!user) return json12({ error: "\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF" }, 404);
    if (!user.withdrawal_password_hash) return json12({ error: "\u0986\u0997\u09C7 \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8", code: "PASSWORD_REQUIRED" }, 400);
    if (typeof body.password !== "string" || await hash2(body.password) !== user.withdrawal_password_hash) return json12({ error: "\u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC" }, 400);
    if (body.action === "wallet") {
      if (!["bkash", "nagad"].includes(body.provider || "") || !/^01[3-9]\d{8}$/.test(body.account || "")) return json12({ error: "\u09B8\u09A0\u09BF\u0995 \u09AC\u09BF\u0995\u09BE\u09B6/\u09A8\u0997\u09A6 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09BF\u09A8" }, 400);
      const count3 = await env2.DB.prepare("SELECT COUNT(*) AS n FROM withdrawal_wallets WHERE user_id=?").bind(uid).first();
      if ((count3?.n ?? 0) >= 2) return json12({ error: "\u09B8\u09B0\u09CD\u09AC\u09CB\u099A\u09CD\u099A \u09E8\u099F\u09BF \u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09AF\u09BE\u09AC\u09C7" }, 409);
      await env2.DB.prepare("INSERT INTO withdrawal_wallets(id,user_id,provider,account,created_at) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(), uid, body.provider, body.account, Date.now()).run();
      return json12({ success: true });
    }
    if (body.action === "withdraw") {
      const settings = await env2.DB.prepare("SELECT minimum_amount,fee_percent FROM withdrawal_settings WHERE id=1").first();
      const amount = Number(body.amount), min = settings?.minimum_amount ?? 1e3, percent = settings?.fee_percent ?? 2;
      if (!Number.isSafeInteger(amount) || amount < min) return json12({ error: `\u09B8\u09B0\u09CD\u09AC\u09A8\u09BF\u09AE\u09CD\u09A8 \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u09F3${min}` }, 400);
      if (amount > user.balance) return json12({ error: "\u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AC\u09CD\u09AF\u09BE\u09B2\u09C7\u09A8\u09CD\u09B8 \u09A8\u09C7\u0987" }, 400);
      const wallet = await env2.DB.prepare("SELECT id FROM withdrawal_wallets WHERE id=? AND user_id=?").bind(body.walletId, uid).first();
      if (!wallet) return json12({ error: "\u0993\u09DF\u09BE\u09B2\u09C7\u099F \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF" }, 400);
      const fee = Math.round(amount * percent / 100), now = Date.now(), id = crypto.randomUUID();
      await env2.DB.batch([
        env2.DB.prepare("UPDATE users SET balance=balance-? WHERE id=? AND balance>=?").bind(amount, uid, amount),
        env2.DB.prepare("INSERT INTO withdrawals(id,user_id,wallet_id,amount,fee,net,status,created_at) SELECT ?,?,?,?, ?,?, 'pending',? WHERE changes()>0").bind(id, uid, body.walletId, amount, fee, amount - fee, now),
        env2.DB.prepare("INSERT INTO transactions(id,user_id,type,amount,label,created_at) SELECT ?,?,'debit',?,'\u0985\u09B0\u09CD\u09A5 \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8',? WHERE changes()>0").bind(crypto.randomUUID(), uid, amount, now)
      ]);
      const row = await env2.DB.prepare("SELECT id FROM withdrawals WHERE id=?").bind(id).first();
      return row ? json12({ success: true, id, amount, fee, net: amount - fee }) : json12({ error: "\u0985\u09A8\u09C1\u09B0\u09CB\u09A7 \u099C\u09AE\u09BE \u09B9\u09DF\u09A8\u09BF" }, 409);
    }
    return json12({ error: "Invalid action" }, 400);
  } catch (error3) {
    console.error("Withdrawals API:", error3);
    return json12({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7" }, 500);
  }
}, "onRequest");

// superadmin/_middleware.ts
var onRequest8 = /* @__PURE__ */ __name(async ({ request, env: env2, next }) => {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/superadmin")) {
    return next();
  }
  const sessionId = request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
  if (!sessionId) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/signin" }
    });
  }
  const session = await env2.DB.prepare(
    'SELECT COALESCE(u.role_text, u.role, "user") as role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?'
  ).bind(sessionId, Date.now()).first();
  if (!session || session.role !== "admin") {
    return new Response("Not Found", { status: 404 });
  }
  return next();
}, "onRequest");

// _middleware.ts
async function onRequest9(context2) {
  const { request, env: env2 } = context2;
  const { pathname } = new URL(request.url);
  if (pathname === "/signin" || pathname === "/signup" || pathname === "/ghm-logo.png" || pathname.startsWith("/api/") || pathname.startsWith("/assets/") || pathname.startsWith("/_next/")) return context2.next();
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
  const session = sessionId && await env2.DB.prepare("SELECT id FROM sessions WHERE id = ? AND expires_at > ?").bind(sessionId, Date.now()).first();
  if (session) return context2.next();
  return Response.redirect(new URL("/signin", request.url), 302);
}
__name(onRequest9, "onRequest");

// ../.wrangler/tmp/pages-xDseEq/functionsRoutes-0.8435310244218094.mjs
var routes = [
  {
    routePath: "/api/admin/package-image",
    mountPath: "/api/admin",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/admin/package-image",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/auth/logout",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/auth/session",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/auth/signin",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/cron/credit-daily-profits",
    mountPath: "/api/cron",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/deposits/create",
    mountPath: "/api/deposits",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/deposits/create",
    mountPath: "/api/deposits",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/deposits/status",
    mountPath: "/api/deposits",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/deposits/webhook",
    mountPath: "/api/deposits",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/packages/purchase",
    mountPath: "/api/packages",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/admin/deposits",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/admin/packages",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/admin/referrals",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/admin/withdrawals",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/package-images/:id",
    mountPath: "/api/package-images",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/apk-download",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/dashboard",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/notify",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/packages",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/profile",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/referrals",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/send-code",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/signup",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/withdrawal-password",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/withdrawal-password",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/work",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/site-settings",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  },
  {
    routePath: "/api/team",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest6]
  },
  {
    routePath: "/api/withdrawals",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest7]
  },
  {
    routePath: "/superadmin",
    mountPath: "/superadmin",
    method: "",
    middlewares: [onRequest8],
    modules: []
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest9],
    modules: []
  }
];

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
