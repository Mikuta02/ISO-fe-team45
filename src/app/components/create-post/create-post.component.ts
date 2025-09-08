import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
  description: string = '';
  latitude: number = 0;
  longitude: number = 0;
  image: File | null = null;

  constructor(private postService: PostService) {}

  onImageSelected(event: any): void {
    if (event?.target?.files?.length > 0) {
      this.image = event.target.files[0];
    }
  }

  onLocationSelected(event: { latitude: number; longitude: number }): void {
    this.latitude = event.latitude;
    this.longitude = event.longitude;
  }

  createPost(): void {
    if (!this.description || !this.image) {
      alert('Please provide all the details');
      return;
    }

    this.postService.createPost(this.description, this.latitude, this.longitude, this.image)
      .subscribe({
        next: (_response: any) => {
          alert('Post created successfully');
          console.log('OK', _response);
          // opciono: reset form
          // this.description = ''; this.latitude = 0; this.longitude = 0; this.image = null;
        },
        error: (err: any) => {
          console.error('Error creating post', err);
          console.error('status:', err.status);
          console.error('payload:', err.error); // ovde je problem+json
        }
      });
  }
}
