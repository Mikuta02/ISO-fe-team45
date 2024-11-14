import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit {
  postId: number = 0;
  post: any = {
    description: '',
    image: null,
    locationLatitude: 45.2671,
    locationLongitude: 19.8335
  };

  selectedImage: File | null = null;

  constructor(private postService: PostService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPost();
  }

  loadPost(): void {
    this.postService.getPostById(this.postId).subscribe({
      next: (data) => {
        this.post = data;
      },
      error: (err) => {
        console.error('Error loading post', err);
      }
    });
  }

  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedImage = fileInput.files[0];
    }
  }

  onCoordinatesChange(coords: { latitude: number, longitude: number }): void {
    this.post.locationLatitude = coords.latitude;
    this.post.locationLongitude = coords.longitude;
  }

  updatePost(): void {
    const formData = new FormData();

    // Dodavanje podataka u FormData
    formData.append('description', this.post.description);
    formData.append('latitude', String(this.post.locationLatitude));
    formData.append('longitude', String(this.post.locationLongitude));

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    // Slanje zahteva bez ručnog dodavanja Content-Type
    this.postService.updatePost(this.postId, formData).subscribe({
      next: () => {
        alert('Post updated successfully');
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        console.error('Error updating post', err);
      }
    });
  }
}
