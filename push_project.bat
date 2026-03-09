@echo off
set GIT_SSH=C:\Windows\System32\OpenSSH\ssh.exe
set GIT_SSH_COMMAND=ssh -i "C:/Users/pelop/.ssh/git-dramosrodriguez" -o StrictHostKeyChecking=no
git push -u origin main
