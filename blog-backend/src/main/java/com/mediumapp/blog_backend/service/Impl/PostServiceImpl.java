package com.mediumapp.blog_backend.service.Impl;

import com.mediumapp.blog_backend.dto.PostDTO;
import com.mediumapp.blog_backend.entity.Post;
import com.mediumapp.blog_backend.entity.Tag;
import com.mediumapp.blog_backend.enums.PostStatus;
import com.mediumapp.blog_backend.exception.ApiException;
import com.mediumapp.blog_backend.repository.PostRepository;
import com.mediumapp.blog_backend.repository.TagRepository;
import com.mediumapp.blog_backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {
    @Autowired
    private final PostRepository postRepo;
    @Autowired
    private final TagRepository tagRepo;


    public PostServiceImpl(PostRepository postRepo, TagRepository tagRepo) {
        this.postRepo = postRepo;
        this.tagRepo = tagRepo;
    }

    @Override
    public PostDTO createPost(String name, String content, String postedBy, List<String> tagNames) {
        Post post = new Post();
        post.setName(name);
        post.setContent(content);
        post.setPostedBy(postedBy);
        post.setDate(LocalDateTime.now());
        post.setLikeCounts(0);
        post.setViewCounts(0);
        post.setStatus(PostStatus.PENDING);

        if (tagNames != null && !tagNames.isEmpty()) {
            Set<Tag> tags = tagNames.stream()
                    .filter(t -> t != null && !t.trim().isEmpty())
                    .map(tagName -> tagRepo.findByName(tagName.trim())
                            .orElseGet(() -> {
                                Tag newTag = new Tag();
                                newTag.setName(tagName.trim());
                                return tagRepo.save(newTag);
                            }))
                    .collect(Collectors.toSet());
            post.setTags(tags);
        }

        Post savedPost = postRepo.save(post);
        return mapToDTO(savedPost);
    }

    @Override
    public void approvePost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found with id: " + postId));
        post.setStatus(PostStatus.APPROVED);
        postRepo.save(post);
    }

    @Override
    public long countPostsByStatus(PostStatus status) {
        return postRepo.countByStatus(status);
    }

    @Override
    public PostDTO getPostById(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found with id: " + postId));
        if (post.getStatus() == PostStatus.PENDING && post.getDate().isBefore(LocalDateTime.now().minusDays(3))) {
            post.setStatus(PostStatus.OVERDUE);
            postRepo.save(post);
        }
        return mapToDTO(post);
    }

    @Override
    public Page<PostDTO> getAllPosts(Pageable pageable) {
        return postRepo.findAllByStatus(PostStatus.APPROVED, pageable).map(post -> new PostDTO(
                post.getId(),
                post.getName(),
                post.getContent(),
                post.getPostedBy(),
                post.getImg(),
                post.getDate(),
                post.getLikeCounts(),
                post.getViewCounts(),
                post.getTags() != null ? post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()) : new HashSet<>(),
                post.getStatus()
        ));
    }

    @Override
    public void likePost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found with id: " + postId));
        post.setLikeCounts(post.getLikeCounts() + 1);
        postRepo.save(post);
    }

    @Override
    public List<PostDTO> searchPostsByName(String name) {
        return postRepo.findByNameContainingIgnoreCase(name).stream()
                .map(post -> new PostDTO(
                        post.getId(),
                        post.getName(),
                        post.getContent(),
                        post.getPostedBy(),
                        post.getImg(),
                        post.getDate(),
                        post.getLikeCounts(),
                        post.getViewCounts(),
                        post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()),
                        post.getStatus()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public Page<PostDTO> getPostsByTag(String tagName, Pageable pageable) {
        return postRepo.findByTagsName(tagName, pageable).map(post -> new PostDTO(
                post.getId(),
                post.getName(),
                post.getContent(),
                post.getPostedBy(),
                post.getImg(),
                post.getDate(),
                post.getLikeCounts(),
                post.getViewCounts(),
                post.getTags() != null ? post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()) : new HashSet<>(),
                post.getStatus()
        ));
    }

    @Override
    public long getTotalPosts() {
        return postRepo.count();
    }

    @Override
    public List<Object[]> getPostsByDate() {
        return postRepo.countPostsByDate();
    }

    @Override
    public void deletePost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found with id: " + postId));
        postRepo.delete(post);
    }

    private PostDTO mapToDTO(Post post) {
        return new PostDTO(
                post.getId(),
                post.getName(),
                post.getContent(),
                post.getPostedBy(),
                post.getImg(),
                post.getDate(),
                post.getLikeCounts(),
                post.getViewCounts(),
                post.getTags() != null ? post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()) : new HashSet<>(),
                post.getStatus()
        );
    }
}