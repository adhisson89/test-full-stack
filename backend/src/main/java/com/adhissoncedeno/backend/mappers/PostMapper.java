package com.adhissoncedeno.backend.mappers;

import com.adhissoncedeno.backend.model.dtos.request.PostRequestDTO;
import com.adhissoncedeno.backend.model.dtos.response.PostResponseDTO;
import com.adhissoncedeno.backend.model.entities.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public Post toEntity(PostRequestDTO dto) {
        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setPublic(dto.isPublic());
        return post;
    }

    public PostResponseDTO toDto(Post entity) {
        PostResponseDTO dto = new PostResponseDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setPublic(entity.isPublic());

        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }

        return dto;
    }
}
