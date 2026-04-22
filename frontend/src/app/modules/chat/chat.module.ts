import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ChatPage } from './pages/chat/chat.page';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickerModule,
    RouterModule.forChild([
      { path: '', component: ChatPage }
    ])
  ],
  declarations: [ChatPage, ChatRoomComponent]
})
export class ChatModule {}
