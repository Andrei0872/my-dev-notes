# Docker Notebook

* [Concepts](#concepts)
    * [Container](#container)
    * [VM](#vm)
* [Useful Commands](#useful-commands)

## Concepts

### Container

* an **isolated unit of software**(**code**, **libraries**, **services**, **dependencies**, **processes** - all **packaged up** together)

* virtualizes the OS

* is a **running instance** of an **image**

* more resources are shared between containers

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
