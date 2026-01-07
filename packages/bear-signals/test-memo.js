import { createSignal, createEffect, createMemo } from './lib/index.js';

console.log('=== Test 1: Basic memo ===');
let computeCount = 0;

const [count, setCount] = createSignal(5);
const doubled = createMemo(() => {
	computeCount++;
	console.log(`  Computing doubled (computation #${computeCount})`);
	return count() * 2;
});

console.log('First read:', doubled());
console.log('Second read:', doubled()); // Should NOT recompute
console.log('Third read:', doubled());  // Should NOT recompute

console.log('\n=== Test 2: Memo updates when dependency changes ===');
setCount(10);
console.log('After update:', doubled()); // Should recompute

console.log('\n=== Test 3: Memo in effect ===');
const [a, setA] = createSignal(2);
const [b, setB] = createSignal(3);

const sum = createMemo(() => {
	console.log('  Computing sum');
	return a() + b();
});

createEffect(() => {
	console.log('Effect: sum =', sum());
});

console.log('\nUpdating a...');
setA(5);

console.log('\nUpdating b...');
setB(7);

console.log('\n=== Test 4: Chained memos ===');
const [base, setBase] = createSignal(2);
const squared = createMemo(() => {
	console.log('  Computing squared');
	return base() * base();
});
const plusTen = createMemo(() => {
	console.log('  Computing plusTen');
	return squared() + 10;
});

console.log('Result:', plusTen());
console.log('Result again:', plusTen()); // Should not recompute

console.log('\nUpdating base...');
setBase(3);
console.log('New result:', plusTen());
