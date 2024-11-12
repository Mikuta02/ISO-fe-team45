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

  onImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.image = event.target.files[0];
    }
  }

  onLocationSelected(event: { latitude: number, longitude: number }) {
    // Postavljanje latitude i longitude u formi kada korisnik klikne na mapu
    this.latitude = event.latitude;
    this.longitude = event.longitude;
  }



  createPost() {
    if (!this.description || !this.image) {
      alert("Please provide all the details");
      return;
    }

    this.postService.createPost(this.description, this.latitude, this.longitude, this.image)
      .subscribe({
        next: (response) => {
          alert('Post created successfully');
        },
        error: (err) => {
          console.error('Error creating post', err);
        }
      });
  }
}
