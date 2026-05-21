// src/app/pages/contact/contact.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import emailjs from 'emailjs-com';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  
  // Contact form data
  contactData: ContactFormData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  
  // Form submission state
  isSubmitting: boolean = false;
  submitted: boolean = false;
  isSuccess: boolean = false;
  
  constructor() { }

  ngOnInit(): void {
    // Initialize EmailJS with public key
    emailjs.init('fFpVFSIOCoH8DfQFI');
  }

  submitForm(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.submitted = false;
    
    // Prepare template parameters
    const templateParams = {
      name: this.contactData.name,
      email: this.contactData.email,
      title: this.contactData.subject,
      message: this.contactData.message
    };
    
    // Send email using EmailJS
    emailjs.send('gmail_service', 'template_xfcamum', templateParams)
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        this.isSubmitting = false;
        this.submitted = true;
        this.isSuccess = true;
        
        // Reset form data
        this.contactData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        
        // Reset form state
        form.resetForm();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitted = false;
        }, 5000);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        this.isSubmitting = false;
        this.submitted = true;
        this.isSuccess = false;
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          this.submitted = false;
        }, 5000);
      });
  }
}