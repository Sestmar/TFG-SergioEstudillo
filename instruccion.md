Usuario@LAPTOP-8VI2TBCD MINGW64 ~/Documents/2DAM/TFG-SergioEstudillo/TFG-SergioEstudillo (preprod)
$ git add .
warning: in the working copy of 'frontend/tsconfig.app.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/cypress.config.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/cypress/e2e/flujo-critico.cy.ts', LF will be replaced by CRLF the next time Git touches it
error: open("frontend/cypress/screenshots/flujo-critico.cy.ts/Flujo Crítico — DAM United FC -- 2. Dashboard del Entrenador -- debería mostrar el nombre del equipo gestionado -- before each hook (failed).png"): Filename too long
error: unable to index file 'frontend/cypress/screenshots/flujo-critico.cy.ts/Flujo Crítico — DAM United FC -- 2. Dashboard del Entrenador -- debería mostrar el nombre del equipo gestionado -- before each hook (failed).png'
fatal: adding files failed

Usuario@LAPTOP-8VI2TBCD MINGW64 ~/Documents/2DAM/TFG-SergioEstudillo/TFG-SergioEstudillo (preprod)
$ git commit -m "Fase de testing completada. Testeado funcionalidades backend y frontend y tests e2e"
On branch preprod
Your branch is up to date with 'origin/preprod'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .github/workflows/frontend-ci.yml
        modified:   frontend/package-lock.json
        modified:   frontend/package.json
        modified:   frontend/src/app/modules/auth/pages/login/login.page.html
        modified:   frontend/src/app/modules/coach/pages/coach-dashboard/coach-dashboard.page.html
        modified:   frontend/src/app/modules/coach/pages/tactics-pro/tactics-pro.page.html
        modified:   frontend/src/app/modules/match-detail/match-detail.page.html
        modified:   frontend/tsconfig.app.json
        modified:   futuras-mejoras.md
        modified:   instruccion.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        frontend/cypress.config.ts
        frontend/cypress/
        frontend/karma.conf.js
        frontend/src/app/core/services/admin/admin.service.spec.ts
        frontend/src/app/core/services/api/api.service.spec.ts
        frontend/src/app/core/services/auth/auth.service.spec.ts
        frontend/src/app/core/services/match/match.service.spec.ts
        frontend/src/test.ts
        frontend/tsconfig.spec.json
        src/backend-tfg/backend-tfg/src/test/java/com/DAMUnitedFC/backend_tfg/service/AdminServiceTest.java
        src/backend-tfg/backend-tfg/src/test/java/com/DAMUnitedFC/backend_tfg/service/AlineacionServiceTest.java

no changes added to commit (use "git add" and/or "git commit -a")

Usuario@LAPTOP-8VI2TBCD MINGW64 ~/Documents/2DAM/TFG-SergioEstudillo/TFG-SergioEstudillo (preprod)
$ git push origin preprod
Everything up-to-date

Usuario@LAPTOP-8VI2TBCD MINGW64 ~/Documents/2DAM/TFG-SergioEstudillo/TFG-SergioEstudillo (preprod)
$
