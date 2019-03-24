# Database Notebook

## Contents

[Knowledge](#knowledge)

## Knowledge

**Atomic operation**
* operations that can be performed with the data, which are atomic(unbreakable) in nature
* the operation can either succeed or fail, it should never half succeed or half fail
* runs as a single unit and avoid concurrency issues with other operations in the db

**Transactions**
* group operations into a single unit that can avoid half succeeding or half failing between operations
* won't lock rows during reading --> `concurrency`