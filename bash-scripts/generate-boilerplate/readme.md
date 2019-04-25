## Generate boilerplate 
A simple script that will generate the boilerplate for your small UI projects.

### Motivation
Every time I want to experiment a little bit with CSS and/or UI-related stuff I find it quite monotonous to create a new project, add `index.html`, `main.css` and maybe `main.js`.
So now, with the help of a simple command, I can get started much quicker. 

### Getting started

```bash
# pwd = $HOME
mkdir bin && cd $_

touch <name_of_your_script>
sudo chmod 777 <name_of_your_script>

# In order to access your script globally, open `.bash_profile`(if !exists, create it)
# and paste the following line
export PATH=$PATH:/home/andubuntu
```

### Usage

Before running the script, make sure that you choose your location where it would generate the files. You can do this by opening `main.sh` and look for the suggestive comment.

```bash
# If you want your project to have a `main.js` 
<name_of_your_script> <directory_name> js
# Otherwise
<name_of_your_script> <directory_name>
```