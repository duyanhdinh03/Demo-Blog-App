import { Component, OnInit } from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl : './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss']
})
export class RichTextEditorComponent implements OnInit {
  editor!: Editor;

  ngOnInit() {
    this.editor = new Editor({
      content: 'Nhập nội dung...',
      extensions: [
        StarterKit,
        Image.configure({ allowBase64: true }),
      ],
    });
  }

  ngOnDestroy() {
    this.editor.destroy();
  }
}

