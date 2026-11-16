-- Legacy deposits stored paisa; wallet, transactions, and API amounts use taka.
UPDATE deposits SET amount = amount / 100 WHERE amount % 100 = 0;
