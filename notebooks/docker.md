# Docker Notebook

* [Concepts](#concepts)
    * [Container](#container)
    * [VM](#vm)
* [Useful Commands](#useful-commands)

## Concepts

### Container

* a **unit of software**(**code**, **libraries**, **services**, **dependencies** - all **packaged up** together)

* virtualizes the OS

* is a **running instance** of an **image**

### VM

* virtualizes the hardware

### Image 

* shareable chunk of functionality (server, db engine, Linux distribution)

---

### Useful Commands

#### List names of all containers

```bash
docker ps -a --format="{{.Names}}"
```
