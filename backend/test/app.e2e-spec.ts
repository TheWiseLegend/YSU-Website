import {
  INestApplication,
  ValidationPipe,
  Injectable,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from '../src/events/dto';
import { CreateNewsDto, UpdateNewsDto } from 'src/news/dto';
import { CreateGalleryDto, UpdateGalleryDto } from 'src/gallery/dto';
import { CreateBranchDto, UpdateBranchDto } from 'src/branches/dto';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from 'src/team-members/dto';

describe('Events e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    
    // Listen on the same port that pactum will connect to
    await app.listen(3333);
    console.log('Test server started on port 3333');

    prisma = app.get(PrismaService);
    // Clean database
    await prisma.cleanDb();
    
    // Update base URL to match the port where the server is listening
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
    console.log('Test server closed');
  });

  describe('Admin Authentication', () => {
    describe('Admin login', () => {
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/admin-auth/login')
          .withBody({})
          .expectStatus(400);
      });

      it('should throw if password is incorrect', () => {
        return pactum
          .spec()
          .post('/admin-auth/login')
          .withBody({ password: 'wrongpassword' })
          .expectStatus(401);
      });

      it('should return jwt token if password is correct', () => {
        return pactum
          .spec()
          .post('/admin-auth/login')
          .withBody({ password: 'supersecret123' })
          .expectStatus(201)
          .expectBodyContains('access_token')
          .stores('adminToken', 'access_token');
      });
    });

    describe('Protected routes', () => {
      it('should deny access to protected route without token', () => {
        return pactum
          .spec()
          .post('/news')
          .withBody({
            title: 'Test',
            summary: 'Test',
            content: 'Test',
            imageUrl: 'https://example.com/image.jpg'
          })
          .expectStatus(401);
      });

      it('should deny access with invalid token', () => {
        return pactum
          .spec()
          .post('/news')
          .withHeaders({
            Authorization: 'Bearer invalid-token'
          })
          .withBody({
            title: 'Test',
            summary: 'Test', 
            content: 'Test',
            imageUrl: 'https://example.com/image.jpg'
          })
          .expectStatus(401);
      });
    });
  });

  describe('News', () => {
    let adminToken: string;

    const createNewsDto: CreateNewsDto = {
      title: 'Test News',
      summary: 'This is a test news summary',
      content: 'This is the content of the test news',
      imageUrl: 'https://example.com/image.jpg',
    };

    const updateNewsDto: UpdateNewsDto = {
      title: 'Updated News Title',
      summary: 'Updated summary',
    };

    beforeAll(async () => {
      // Clean database before running news tests
      await prisma.cleanDb();
      
      // Get admin token once for all news tests
      const loginResponse = await pactum
        .spec()
        .post('/admin-auth/login')
        .withBody({ password: 'supersecret123' })
        .expectStatus(201);
      adminToken = loginResponse.body.access_token;
    });

    describe('Get empty news list', () => {
      it('should get empty news list', () => {
        return pactum
          .spec()
          .get('/news')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create news', () => {
      it('should throw if title is empty', () => {
        return pactum
          .spec()
          .post('/news')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            summary: createNewsDto.summary,
            imageUrl: createNewsDto.imageUrl,
          })
          .expectStatus(400);
      });

      it('should throw if summary is empty', () => {
        return pactum
          .spec()
          .post('/news')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createNewsDto.title,
            imageUrl: createNewsDto.imageUrl,
          })
          .expectStatus(400);
      });

      it('should throw if imageUrl is empty', () => {
        return pactum
          .spec()
          .post('/news')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createNewsDto.title,
            summary: createNewsDto.summary,
          })
          .expectStatus(400);
      });

      it('should create news', () => {
        return pactum
          .spec()
          .post('/news')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(createNewsDto)
          .expectStatus(201)
          .stores('newsId', 'id');
      });
    });

    describe('Get all news', () => {
      it('should get all news', () => {
        return pactum
          .spec()
          .get('/news')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get news by id', () => {
      it('should get news by id', () => {
        return pactum
          .spec()
          .get('/news/{id}')
          .withPathParams('id', '$S{newsId}')
          .expectStatus(200)
          .expectBodyContains('$S{newsId}')
          .expectBodyContains(createNewsDto.title);
      });

      it('should throw if news id does not exist', () => {
        return pactum
          .spec()
          .get('/news/999999')  // Non-existent ID
          .expectStatus(404);
      });
    });

    describe('Update news by id', () => {
      it('should update news', () => {
        return pactum
          .spec()
          .put('/news/{id}')
          .withPathParams('id', '$S{newsId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateNewsDto)
          .expectStatus(200)
          .expectBodyContains(updateNewsDto.title)
          .expectBodyContains(updateNewsDto.summary)
          .expectBodyContains(createNewsDto.imageUrl); // Unchanged field should remain
      });

      it('should throw if news id does not exist', () => {
        return pactum
          .spec()
          .put('/news/999999') // Non-existent ID
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateNewsDto)
          .expectStatus(404);
      });
    });

    describe('Delete news by id', () => {
      it('should delete news', () => {
        return pactum
          .spec()
          .delete('/news/{id}')
          .withPathParams('id', '$S{newsId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .expectStatus(204);
      });

      it('should get empty news list after deletion', () => {
        return pactum
          .spec()
          .get('/news')
          .expectStatus(200)
          .expectJsonLength(0);
      });

      it('should throw if trying to get deleted news', () => {
        return pactum
          .spec()
          .get('/news/{id}')
          .withPathParams('id', '$S{newsId}')
          .expectStatus(404);
      });
    });
  });

  describe('Events', () => {
    let adminToken: string;
  
    const createEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'This is a test event description',
      date: new Date().toISOString(),
      location: 'Test Location',
      imageUrl: 'https://example.com/event-image.jpg',
    };
  
    const updateEventDto: UpdateEventDto = {
      title: 'Updated Event Title',
      description: 'Updated description',
    };
  
    beforeAll(async () => {
      // Get admin token before running events tests
      const loginResponse = await pactum
        .spec()
        .post('/admin-auth/login')
        .withBody({ password: 'supersecret123' })
        .expectStatus(201);
      adminToken = loginResponse.body.access_token;
    });
  
    describe('Get empty events list', () => {
      it('should get empty events list', () => {
        return pactum
          .spec()
          .get('/events')
          .expectStatus(200)
          .expectBody([]);
      });
    });
  
    describe('Create event', () => {
      it('should throw if title is empty', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            description: createEventDto.description,
            date: createEventDto.date,
            location: createEventDto.location,
            imageUrl: createEventDto.imageUrl,
          })
          .expectStatus(400);
      });
  
      it('should throw if description is empty', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createEventDto.title,
            date: createEventDto.date,
            location: createEventDto.location,
            imageUrl: createEventDto.imageUrl,
          })
          .expectStatus(400);
      });
  
      it('should throw if date is empty', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createEventDto.title,
            description: createEventDto.description,
            location: createEventDto.location,
            imageUrl: createEventDto.imageUrl,
          })
          .expectStatus(400);
      });
  
      it('should throw if location is empty', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createEventDto.title,
            description: createEventDto.description,
            date: createEventDto.date,
            imageUrl: createEventDto.imageUrl,
          })
          .expectStatus(400);
      });
  
      it('should throw if imageUrl is empty', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createEventDto.title,
            description: createEventDto.description,
            date: createEventDto.date,
            location: createEventDto.location,
          })
          .expectStatus(400);
      });
  
      it('should create event', () => {
        return pactum
          .spec()
          .post('/events')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(createEventDto)
          .expectStatus(201)
          .stores('eventId', 'id');
      });
    });
  
    describe('Get all events', () => {
      it('should get all events', () => {
        return pactum
          .spec()
          .get('/events')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
  
    describe('Get event by id', () => {
      it('should get event by id', () => {
        return pactum
          .spec()
          .get('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .expectStatus(200)
          .expectBodyContains('$S{eventId}')
          .expectBodyContains(createEventDto.title);
      });
  
      it('should throw if event id does not exist', () => {
        return pactum
          .spec()
          .get('/events/nonexistentid')
          .expectStatus(404);
      });
    });
  
    describe('Update event by id', () => {
      it('should update event', () => {
        return pactum
          .spec()
          .put('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateEventDto)
          .expectStatus(200)
          .expectBodyContains(updateEventDto.title)
          .expectBodyContains(updateEventDto.description)
          .expectBodyContains(createEventDto.location);
      });
  
      it('should throw if event id does not exist', () => {
        return pactum
          .spec()
          .put('/events/nonexistentid')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateEventDto)
          .expectStatus(404);
      });
    });
  
    describe('Delete event by id', () => {
      it('should delete event', () => {
        return pactum
          .spec()
          .delete('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .expectStatus(204);
      });
  
      it('should get empty events list after deletion', () => {
        return pactum
          .spec()
          .get('/events')
          .expectStatus(200)
          .expectJsonLength(0);
      });
  
      it('should throw if trying to get deleted event', () => {
        return pactum
          .spec()
          .get('/events/{id}')
          .withPathParams('id', '$S{eventId}')
          .expectStatus(404);
      });
    });
  });

  describe('Gallery', () => {
    let adminToken: string;
  
    const createGalleryDto: CreateGalleryDto = {
      title: 'Test Gallery',
      description: 'This is a test gallery album',
      mainImage: 'https://example.com/main-image.jpg',
      images: [
        { url: 'https://example.com/image1.jpg' },
        { url: 'https://example.com/image2.jpg' }
      ]
    };
  
    const updateGalleryDto: UpdateGalleryDto = {
      title: 'Updated Gallery Title',
      description: 'Updated gallery description',
    };
  
    const newImageUrl = 'https://example.com/new-image.jpg';
  
    beforeAll(async () => {
      // Get admin token before running gallery tests
      const loginResponse = await pactum
        .spec()
        .post('/admin-auth/login')
        .withBody({ password: 'supersecret123' })
        .expectStatus(201);
      adminToken = loginResponse.body.access_token;
    });
  
    describe('Get empty gallery list', () => {
      it('should get empty gallery list', () => {
        return pactum
          .spec()
          .get('/gallery')
          .expectStatus(200)
          .expectBody([]);
      });
    });
  
    describe('Create gallery', () => {
      it('should throw if title is empty', () => {
        return pactum
          .spec()
          .post('/gallery')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            description: createGalleryDto.description,
            mainImage: createGalleryDto.mainImage,
          })
          .expectStatus(400);
      });
  
      it('should throw if mainImage is empty', () => {
        return pactum
          .spec()
          .post('/gallery')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            title: createGalleryDto.title,
            description: createGalleryDto.description,
          })
          .expectStatus(400);
      });
  
      it('should create gallery', () => {
        return pactum
          .spec()
          .post('/gallery')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(createGalleryDto)
          .expectStatus(201)
          .stores('galleryId', 'id')
          .expectJsonLength('images', 2);
      });
    });
  
    describe('Get all galleries', () => {
      it('should get all galleries', () => {
        return pactum
          .spec()
          .get('/gallery')
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJsonLength('0.images', 2);
      });
    });
  
    describe('Get gallery by id', () => {
      it('should get gallery by id', () => {
        return pactum
          .spec()
          .get('/gallery/{id}')
          .withPathParams('id', '$S{galleryId}')
          .expectStatus(200)
          .expectBodyContains('$S{galleryId}')
          .expectBodyContains(createGalleryDto.title)
          .expectJsonLength('images', 2);
      });
  
      it('should throw if gallery id does not exist', () => {
        return pactum
          .spec()
          .get('/gallery/nonexistentid')
          .expectStatus(404);
      });
    });
  
    describe('Update gallery by id', () => {
      it('should update gallery', () => {
        return pactum
          .spec()
          .put('/gallery/{id}')
          .withPathParams('id', '$S{galleryId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateGalleryDto)
          .expectStatus(200)
          .expectBodyContains(updateGalleryDto.title)
          .expectBodyContains(updateGalleryDto.description)
          .expectBodyContains(createGalleryDto.mainImage);
      });
  
      it('should throw if gallery id does not exist', () => {
        return pactum
          .spec()
          .put('/gallery/nonexistentid')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateGalleryDto)
          .expectStatus(404);
      });
    });
  
    describe('Add image to gallery', () => {
      it('should add new image to gallery', () => {
        return pactum
          .spec()
          .post('/gallery/{id}/images')
          .withPathParams('id', '$S{galleryId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({ url: newImageUrl })
          .expectStatus(201)
          .stores('imageId', 'id')
          .expectBodyContains(newImageUrl);
      });
  
      it('should throw if gallery id does not exist', () => {
        return pactum
          .spec()
          .post('/gallery/nonexistentid/images')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({ url: newImageUrl })
          .expectStatus(404);
      });
      
      it('should have 3 images after adding one', () => {
        return pactum
          .spec()
          .get('/gallery/{id}')
          .withPathParams('id', '$S{galleryId}')
          .expectStatus(200)
          .expectJsonLength('images', 3);
      });
    });
    
    describe('Remove image from gallery', () => {
      it('should remove an image from gallery', () => {
        return pactum
          .spec()
          .delete('/gallery/images/{id}')
          .withPathParams('id', '$S{imageId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .expectStatus(204);
      });
      
      it('should have 2 images after removing one', () => {
        return pactum
          .spec()
          .get('/gallery/{id}')
          .withPathParams('id', '$S{galleryId}')
          .expectStatus(200)
          .expectJsonLength('images', 2);
      });
      
      it('should throw if image id does not exist', () => {
        return pactum
          .spec()
          .delete('/gallery/images/nonexistentid')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .expectStatus(404);
      });
    });
  
    describe('Delete gallery by id', () => {
      it('should delete gallery', () => {
        return pactum
          .spec()
          .delete('/gallery/{id}')
          .withPathParams('id', '$S{galleryId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .expectStatus(204);
      });
  
      it('should get empty gallery list after deletion', () => {
        return pactum
          .spec()
          .get('/gallery')
          .expectStatus(200)
          .expectJsonLength(0);
      });
  
      it('should throw if trying to get deleted gallery', () => {
        return pactum
          .spec()
          .get('/gallery/{id}')
          .withPathParams('id', '$S{galleryId}')
          .expectStatus(404);
      });
    });
  });

  describe('Branches', () => {
    let adminToken: string;
  
    const createBranchDto: CreateBranchDto = {
      universityName: 'Test University',
      city: 'Test City',
      address: '123 Test Street',
      imageUrl: 'https://example.com/branch-image.jpg',
      phone: '+60123456789',
      email: 'test@branch.com',
      description: 'This is a test branch description',
      establishedAt: '2020-01-01T00:00:00Z'
    };
  
    const updateBranchDto: UpdateBranchDto = {
      universityName: 'Updated University',
      city: 'Updated City',
      description: 'Updated description'
    };
  
    beforeAll(async () => {
      // Get admin token before running branches tests  
      const loginResponse = await pactum
        .spec()
        .post('/admin-auth/login')
        .withBody({ password: 'supersecret123' })
        .expectStatus(201);
      adminToken = loginResponse.body.access_token;
    });
  
    describe('Get empty branches list', () => {
      it('should get empty branches list', () => {
        return pactum
          .spec()
          .get('/branches')
          .expectStatus(200)
          .expectBody([]);
      });
    });
  
    describe('Create branch', () => {
      it('should throw if universityName is empty', () => {
        return pactum
          .spec()
          .post('/branches')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            city: createBranchDto.city,
            address: createBranchDto.address,
            imageUrl: createBranchDto.imageUrl,
            phone: createBranchDto.phone,
            description: createBranchDto.description,
            establishedAt: createBranchDto.establishedAt
          })
          .expectStatus(400);
      });
  
      it('should throw if city is empty', () => {
        return pactum
          .spec()
          .post('/branches')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody({
            universityName: createBranchDto.universityName,
            address: createBranchDto.address,
            imageUrl: createBranchDto.imageUrl,
            phone: createBranchDto.phone,
            description: createBranchDto.description,
            establishedAt: createBranchDto.establishedAt
          })
          .expectStatus(400);
      });
  
      it('should create branch', () => {
        return pactum
          .spec()
          .post('/branches')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(createBranchDto)
          .expectStatus(201)
          .stores('branchId', 'id')
          .expectBodyContains(createBranchDto.universityName);
      });
    });
  
    describe('Get all branches', () => {
      it('should get all branches', () => {
        return pactum
          .spec()
          .get('/branches')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
  
    describe('Get branch by id', () => {
      it('should get branch by id', () => {
        return pactum
          .spec()
          .get('/branches/{id}')
          .withPathParams('id', '$S{branchId}')
          .expectStatus(200)
          .expectBodyContains('$S{branchId}')
          .expectBodyContains(createBranchDto.universityName);
      });
  
      it('should throw if branch id does not exist', () => {
        return pactum
          .spec()
          .get('/branches/nonexistentid')
          .expectStatus(404);
      });
    });
  
    describe('Update branch by id', () => {
      it('should update branch', () => {
        return pactum
          .spec()
          .put('/branches/{id}')
          .withPathParams('id', '$S{branchId}')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateBranchDto)
          .expectStatus(200)
          .expectBodyContains(updateBranchDto.universityName)
          .expectBodyContains(updateBranchDto.city)
          .expectBodyContains(updateBranchDto.description);
      });
  
      it('should throw if branch id does not exist', () => {
        return pactum
          .spec()
          .put('/branches/nonexistentid')
          .withHeaders({
            Authorization: `Bearer ${adminToken}`
          })
          .withBody(updateBranchDto)
          .expectStatus(404);
      });
    });
  });

  // describe('Team Members', () => {
  //   const createTeamMemberDto: Omit<CreateTeamMemberDto, 'branchId'> = {
  //     name: 'John Doe',
  //     position: 'President',
  //     type: 'Executive',
  //     imageUrl: 'https://example.com/john-doe.jpg'
  //   };
  
  //   const updateTeamMemberDto: UpdateTeamMemberDto = {
  //     name: 'John Smith',
  //     position: 'Vice President',
  //     type: 'Executive'
  //   };
  
  //   describe('Get empty team members list for branch', () => {
  //     it('should get empty team members list', () => {
  //       return pactum
  //         .spec()
  //         .get('/branches/{branchId}/team-members')
  //         .withPathParams('branchId', '$S{branchId}')
  //         .expectStatus(200)
  //         .expectBody([]);
  //     });
  //   }); 
  
  //   describe('Create team member', () => {
  //     it('should throw if branch does not exist', () => {
  //       return pactum
  //         .spec()
  //         .post('/branches/nonexistentid/team-members')
  //         .withBody(createTeamMemberDto)
  //         .expectStatus(404);
  //     });
  
  //     it('should  reate team member', () => {
  //       return pactum
  //         .spec()
  //         .post('/branches/{branchId}/team-members')
  //         .withPathParams('branchId', '$S{branchId}')
  //         .withBody(createTeamMemberDto)
  //         .expectStatus(201)
  //         .stores('teamMemberId', 'id')
  //         .expectBodyContains(createTeamMemberDto.name)
  //         .expectBodyContains(createTeamMemberDto.position);
  //     });
  //   });
  
  //   describe('Get team members for branch', () => {
  //     it('should get team members for branch', () => {
  //       return pactum
  //         .spec()
  //         .get('/branches/{branchId}/team-members')
  //         .withPathParams('branchId', '$S{branchId}')
  //         .expectStatus(200)
  //         .expectJsonLength(1)
  //         .expectBodyContains(createTeamMemberDto.name);
  //     });
  
  //     it('should throw if branch does not exist', () => {
  //       return pactum
  //         .spec()
  //         .get('/branches/nonexistentid/team-members')
  //         .expectStatus(404);
  //     });
  //   });
  
  //   describe('Update team member by id', () => {
  //     it('should update team member', () => {
  //       return pactum
  //         .spec()
  //         .put('/team-members/{id}')
  //         .withPathParams('id', '$S{teamMemberId}')
  //         .withBody(updateTeamMemberDto)
  //         .expectStatus(200)
  //         .expectBodyContains(updateTeamMemberDto.name)
  //         .expectBodyContains(updateTeamMemberDto.position);
  //     });
  
  //     it('should throw if team member id does not exist', () => {
  //       return pactum
  //         .spec()
  //         .put('/team-members/nonexistentid')
  //         .withBody(updateTeamMemberDto)
  //         .expectStatus(404);
  //     });
  //   });
  
  //   describe('Delete team member by id', () => {
  //     it('should delete team member', () => {
  //       return pactum
  //         .spec()
  //         .delete('/team-members/{id}')
  //         .withPathParams('id', '$S{teamMemberId}')
  //         .expectStatus(204);
  //     });
  
  //     it('should get empty team members list after deletion', () => {
  //       return pactum
  //         .spec()
  //         .get('/branches/{branchId}/team-members')
  //         .withPathParams('branchId', '$S{branchId}')
  //         .expectStatus(200)
  //         .expectBody([]);
  //     });
  
  //     it('should throw if team member id does not exist', () => {
  //       return pactum
  //         .spec()
  //         .delete('/team-members/nonexistentid')
  //         .expectStatus(404);
  //     });
  //   });
  
  //   describe('Cascade deletion test', () => {
  //     it('should create a team member to test cascade', () => {
  //       return pactum
  //         .spec()
  //         .post('/branches/{branchId}/team-members')
  //         .withPathParams('branchId', '$S{branchId}')
  //         .withBody({
  //           ...createTeamMemberDto,
  //           name: 'Cascade Test Member'
  //         })
  //         .expectStatus(201)
  //         .stores('cascadeTeamMemberId', 'id');
  //     });
  
  //     it('should have team member before branch deletion', () => {
  //       return pactum
  //         .spec()
  //         .get('/branches/{branchId}/team-members')
  //         .withPathParams('branchId', '$S{branchId}')
  //         .expectStatus(200)
  //         .expectJsonLength(1);
  //     });
  
  //     it('should delete branch', () => {
  //       return pactum
  //         .spec()
  //         .delete('/branches/{id}')
  //         .withPathParams('id', '$S{branchId}')
  //         .expectStatus(204);
  //     });
  
  //     it('should get empty branches list after deletion', () => {
  //       return pactum
  //         .spec()
  //         .get('/branches')
  //         .expectStatus(200)
  //         .expectBody([]);
  //     });
  
  //     it('should confirm team member was cascaded deleted', () => {
  //       return pactum
  //         .spec()
  //         .get('/team-members/{id}')
  //         .withPathParams('id', '$S{cascadeTeamMemberId}')
  //         .expectStatus(404);
  //     });
  //   });
  // });

  // describe('Union Team Members', () => {
  //   let adminToken: string;
    
  //   beforeAll(async () => {
  //     // Get admin token before testing protected routes
  //     const loginResponse = await pactum
  //       .spec()
  //       .post('/admin-auth/login')
  //       .withBody({ password: 'supersecret123' })
  //       .expectStatus(201);
  //     adminToken = loginResponse.body.access_token;
  //   });

  //   const createUnionMemberDto = {
  //     name: 'Test Union Member',
  //     position: 'Test Position',
  //     type: 'Test Type',
  //     imageUrl: 'https://example.com/union-member.jpg',
  //   };
  
  //   const updateUnionMemberDto = {
  //     name: 'Updated Union Member',
  //     position: 'Updated Position',
  //   };
  
  //   describe('Get empty union team list', () => {
  //     it('should get empty union team list', () => {
  //       return pactum
  //         .spec()
  //         .get('/union-team')
  //         .expectStatus(200)
  //         .expectBody([]);
  //     });
  //   });
  
  //   describe('Create union team member', () => {
  //     it('should throw if name is empty', () => {
  //       return pactum
  //         .spec()
  //         .post('/union-team')
  //         .withBody({
  //           position: createUnionMemberDto.position,
  //           type: createUnionMemberDto.type,
  //           imageUrl: createUnionMemberDto.imageUrl,
  //         })
  //         .expectStatus(400);
  //     });
  
  //     it('should throw if position is empty', () => {
  //       return pactum
  //         .spec()
  //         .post('/union-team')
  //         .withBody({
  //           name: createUnionMemberDto.name,
  //           type: createUnionMemberDto.type,
  //           imageUrl: createUnionMemberDto.imageUrl,
  //         })
  //         .expectStatus(400);
  //     });
  
  //     it('should throw if type is empty', () => {
  //       return pactum
  //         .spec()
  //         .post('/union-team')
  //         .withBody({
  //           name: createUnionMemberDto.name,
  //           position: createUnionMemberDto.position,
  //           imageUrl: createUnionMemberDto.imageUrl,
  //         })
  //         .expectStatus(400);
  //     });
  
  //     it('should throw if imageUrl is empty', () => {
  //       return pactum
  //         .spec()
  //         .post('/union-team')
  //         .withBody({
  //           name: createUnionMemberDto.name,
  //           position: createUnionMemberDto.position,
  //           type: createUnionMemberDto.type,
  //         })
  //         .expectStatus(400);
  //     });
  
  //     it('should create union team member', () => {
  //       return pactum
  //         .spec()
  //         .post('/union-team')
  //         .withBody(createUnionMemberDto)
  //         .expectStatus(201)
  //         .stores('unionMemberId', 'id');
  //     });
  //   });
  
  //   describe('Get all union team members', () => {
  //     it('should get all union team members', () => {
  //       return pactum
  //         .spec()
  //         .get('/union-team')
  //         .expectStatus(200)
  //         .expectJsonLength(1);
  //     });
  //   });
  
  //   describe('Get union team member by id', () => {
  //     it('should get union team member by id', () => {
  //       return pactum
  //         .spec()
  //         .get('/union-team/{id}')
  //         .withPathParams('id', '$S{unionMemberId}')
  //         .expectStatus(200)
  //         .expectBodyContains('$S{unionMemberId}')
  //         .expectBodyContains(createUnionMemberDto.name);
  //     });
  
  //     it('should throw if union team member id does not exist', () => {
  //       return pactum
  //         .spec()
  //         .get('/union-team/nonexistentid')
  //         .expectStatus(404);
  //     });
  //   });
  
  //   describe('Update union team member by id', () => {
  //     it('should update union team member', () => {
  //       return pactum
  //         .spec()
  //         .put('/union-team/{id}')
  //         .withPathParams('id', '$S{unionMemberId}')
  //         .withHeaders({
  //           Authorization: `Bearer ${adminToken}`
  //         })
  //         .withBody(updateUnionMemberDto)
  //         .expectStatus(200);
  //     });
  
  //     it('should throw if union team member id does not exist', () => {
  //       return pactum
  //         .spec()
  //         .put('/union-team/nonexistentid')
  //         .withBody(updateUnionMemberDto)
  //         .expectStatus(404);
  //     });
  //   });
  
  //   describe('Delete union team member by id', () => {
  //     it('should delete union team member', () => {
  //       return pactum
  //         .spec()
  //         .delete('/union-team/{id}')
  //         .withPathParams('id', '$S{unionMemberId}')
  //         .expectStatus(204);
  //     });
  
  //     it('should get empty union team list after deletion', () => {
  //       return pactum
  //         .spec()
  //         .get('/union-team')
  //         .expectStatus(200)
  //         .expectJsonLength(0);
  //     });
  
  //     it('should throw if trying to get deleted union team member', () => {
  //       return pactum
  //         .spec()
  //         .get('/union-team/{id}')
  //         .withPathParams('id', '$S{unionMemberId}')
  //         .expectStatus(404);
  //     });
  //   });
  // });
})