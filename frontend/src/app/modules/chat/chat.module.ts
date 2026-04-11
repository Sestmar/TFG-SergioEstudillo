import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ChatPage } from './pages/chat/chat.page';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      { path: '', component: ChatPage }
    ])
  ],
  declarations: [ChatPage, ChatRoomComponent]
})
export class ChatModule {}
