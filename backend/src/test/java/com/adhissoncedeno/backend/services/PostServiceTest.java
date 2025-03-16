package com.adhissoncedeno.backend.services;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.adhissoncedeno.backend.mappers.PostMapper;
import com.adhissoncedeno.backend.model.dtos.request.PostRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.PostResponseDTO;
import com.adhissoncedeno.backend.model.entities.Post;
import com.adhissoncedeno.backend.model.entities.User;
import com.adhissoncedeno.backend.repositories.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserService userService;

    @Mock
    private PostMapper postMapper;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private PostService postService;

    private User testUser;
    private Post testPost;
    private PostRequestDTO testPostRequestDTO;
    private PostResponseDTO testPostResponseDTO;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);

        // Setup test data
        testUser = new User();
        testUser.setId(1L);

        testPost = new Post();
        testPost.setTitle("Test Title");
        testPost.setContent("Test Content");
        testPost.setUser(testUser);
        testPost.setPublic(true);

        testPostRequestDTO = new PostRequestDTO();
        testPostRequestDTO.setId(1L);
        testPostRequestDTO.setTitle("Test Title");
        testPostRequestDTO.setContent("Test Content");
        testPostRequestDTO.setUserId(1L);
        testPostRequestDTO.setPublic(true);

        testPostResponseDTO = new PostResponseDTO();
        testPostResponseDTO.setId(1L);
        testPostResponseDTO.setTitle("Test Title");
        testPostResponseDTO.setContent("Test Content");

        // Mock security context
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
    }

    @Test
    public void testFindAll() {
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findAll()).thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(testPostResponseDTO);

        List<PostResponseDTO> result = postService.findAll();

        assertEquals(1, result.size());
        verify(postRepository).findAll();
        verify(postMapper).toDto(testPost);
    }

    @Test
    public void testFindPublicPosts() {
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findByIsPublicTrue()).thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(testPostResponseDTO);

        List<PostResponseDTO> result = postService.findPublicPosts();

        assertEquals(1, result.size());
        verify(postRepository).findByIsPublicTrue();
        verify(postMapper).toDto(testPost);
    }

    @Test
    public void testFindByUserId() {
        List<Post> posts = Collections.singletonList(testPost);
        when(postRepository.findByUserId(1L)).thenReturn(posts);
        when(postMapper.toDto(any(Post.class))).thenReturn(testPostResponseDTO);

        List<PostResponseDTO> result = postService.findByUserId(1L);

        assertEquals(1, result.size());
        verify(postRepository).findByUserId(1L);
        verify(postMapper).toDto(testPost);
    }

    @Test
    public void testSave() {
        when(postMapper.toEntity(testPostRequestDTO)).thenReturn(testPost);
        when(userService.findById(1L)).thenReturn(testUser);
        when(postRepository.save(testPost)).thenReturn(testPost);
        when(postMapper.toDto(testPost)).thenReturn(testPostResponseDTO);

        PostResponseDTO result = postService.save(testPostRequestDTO);

        assertNotNull(result);
        verify(postMapper).toEntity(testPostRequestDTO);
        verify(userService).findById(1L);
        verify(postRepository).save(testPost);
        verify(postMapper).toDto(testPost);
    }

    @Test
    public void testDeleteByIdAsAdmin() {
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ADMIN"));
        when(authentication.getName()).thenReturn("1");
        doReturn(authorities).when(authentication).getAuthorities();
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        postService.deleteById(1L);

        verify(postRepository).deleteById(1L);
    }

    @Test
    public void testDeleteByIdAsOwner() {
        // Setup owner authentication
        when(authentication.getName()).thenReturn("1");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        postService.deleteById(1L);

        verify(postRepository).deleteById(1L);
    }

    @Test
    public void testDeleteByIdNotAuthorized() {
        // Setup non-owner authentication
        when(authentication.getName()).thenReturn("2");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        assertThrows(AccessDeniedException.class, () -> postService.deleteById(1L));
        verify(postRepository, never()).deleteById(anyLong());
    }

    @Test
    public void testUpdateAsAdmin() {
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ADMIN"));
        doReturn(authorities).when(authentication).getAuthorities();
        when(authentication.getName()).thenReturn("1");
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(testPost)).thenReturn(testPostResponseDTO);

        PostResponseDTO result = postService.update(testPostRequestDTO);

        assertNotNull(result);
        verify(postRepository).save(testPost);
        assertEquals("Test Title", testPost.getTitle());
        assertEquals("Test Content", testPost.getContent());
    }

    @Test
    public void testUpdateAsOwner() {
        // Setup owner authentication
        when(authentication.getName()).thenReturn("1");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);
        when(postMapper.toDto(testPost)).thenReturn(testPostResponseDTO);

        PostResponseDTO result = postService.update(testPostRequestDTO);

        assertNotNull(result);
        verify(postRepository).save(testPost);
    }

    @Test
    public void testUpdateNotAuthorized() {
        // Setup non-owner authentication
        when(authentication.getName()).thenReturn("2");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        assertThrows(AccessDeniedException.class, () -> postService.update(testPostRequestDTO));
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    public void testPostNotFound() {
        when(postRepository.findById(99L)).thenReturn(Optional.empty());

        testPostRequestDTO.setId(99L);
        assertThrows(RuntimeException.class, () -> postService.update(testPostRequestDTO));

        assertThrows(RuntimeException.class, () -> postService.deleteById(99L));
    }
}