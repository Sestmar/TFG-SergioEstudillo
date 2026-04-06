./src/app/app-routing.module.ts:98:22-58 - Error: Module not found: Error: Can't resolve './modules/chat/chat.module' in 'C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\frontend\src\app'

./src/app/app.component.ts:10:0-64 - Error: Module not found: Error: Can't resolve './core/services/chat/chat.service' in 'C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\frontend\src\app'

./src/app/modules/coach/pages/coach-dashboard/coach-dashboard.page.ts:14:0-70 - Error: Module not found: Error: Can't resolve 'src/app/core/services/chat/chat.service' in 'C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\frontend\src\app\modules\coach\pages\coach-dashboard'

./src/app/modules/players/pages/player-dashboard/player-dashboard.page.ts:17:0-70 - Error: Module not found: Error: Can't resolve 'src/app/core/services/chat/chat.service' in 'C:\Users\Usuario\Documents\2DAM\TFG-SergioEstudillo\TFG-SergioEstudillo\frontend\src\app\modules\players\pages\player-dashboard'

Error: src/app/app-routing.module.ts:123:32 - error TS2307: Cannot find module './modules/chat/chat.module' or its corresponding type declarations.

123     loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule),
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Error: src/app/app.component.ts:8:29 - error TS2307: Cannot find module './core/services/chat/chat.service' or its corresponding type declarations.

8 import { ChatService } from './core/services/chat/chat.service';
                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Error: src/app/core/services/index.ts:12:15 - error TS2307: Cannot find module './chat/chat.service' or its corresponding type declarations.

12 export * from './chat/chat.service';
                 ~~~~~~~~~~~~~~~~~~~~~


Error: src/app/modules/chat/components/chat-room/chat-room.component.ts:12:46 - error TS2307: Cannot find module 'src/app/core/services/chat/chat.service' or its corresponding type declarations.

12 import { MensajeDto, EnviarMensajeDto } from 'src/app/core/services/chat/chat.service';
                                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Error: src/app/modules/chat/pages/chat/chat.page.ts:7:59 - error TS2307: Cannot find module 'src/app/core/services/chat/chat.service' or its corresponding type declarations.

7 import { ChatService, MensajeDto, EnviarMensajeDto } from 'src/app/core/services/chat/chat.service';
                                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Error: src/app/modules/coach/pages/coach-dashboard/coach-dashboard.page.ts:12:29 - error TS2307: Cannot find module 'src/app/core/services/chat/chat.service' or its corresponding type declarations.

12 import { ChatService } from 'src/app/core/services/chat/chat.service';
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Error: src/app/modules/players/pages/player-dashboard/player-dashboard.page.ts:21:29 - error TS2307: Cannot find module 'src/app/core/services/chat/chat.service' or its corresponding type declarations.

21 import { ChatService } from 'src/app/core/services/chat/chat.service';
                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~




× Failed to compile.