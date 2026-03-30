Usuario@LAPTOP-8VI2TBCD MINGW64 ~/Documents/2DAM/TFG-SergioEstudillo/TFG-SergioEstudillo (preprod)
$ git push origin preprod
Enumerating objects: 123, done.
Counting objects: 100% (123/123), done.
Delta compression using up to 16 threads
Compressing objects: 100% (67/67), done.
Writing objects: 100% (77/77), 31.51 KiB | 1.37 MiB/s, done.
Total 77 (delta 29), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (29/29), completed with 29 local objects.
remote: error: GH013: Repository rule violations found for refs/heads/preprod.
remote:
remote: - GITHUB PUSH PROTECTION
remote:   —————————————————————————————————————————
remote:     Resolve the following violations before pushing again
remote:
remote:     - Push cannot contain secrets
remote:
remote:
remote:      (?) Learn how to resolve a blocked push
remote:      https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection/working-with-push-protection-from-the-command-line#resolving-a-blocked-push
remote:
remote:
remote:       —— Twilio Account String Identifier ——————————————————
remote:        locations:
remote:          - commit: 986c8288ad5110218a0ace44f947c4c9e7c33d93
remote:            path: src/backend-tfg/backend-tfg/src/main/resources/application.properties:42
remote:
remote:        (?) To push, remove secret from commit(s) or follow this URL to allow the secret.
remote:        https://github.com/Sestmar/TFG-SergioEstudillo/security/secret-scanning/unblock-secret/3BgJbYOcniSn6XiwNdcXGgGxHBd
remote:
remote:
remote:
To https://github.com/Sestmar/TFG-SergioEstudillo
 ! [remote rejected] preprod -> preprod (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Sestmar/TFG-SergioEstudillo'

Usuario@LAPTOP-8VI2TBCD MINGW64 ~/Documents/2DAM/TFG-SergioEstudillo/TFG-SergioEstudillo (preprod)
$
