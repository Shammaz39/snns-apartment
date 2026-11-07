package com.snns.apartment.service;

import com.snns.apartment.dto.EventRequest;
import com.snns.apartment.model.Event;
import com.snns.apartment.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final FileStorageService fileStorageService;

    public EventService(EventRepository eventRepository, FileStorageService fileStorageService) {
        this.eventRepository = eventRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAllByOrderByEventDateDesc();
    }

    public List<Event> getPopupNotices() {
        return eventRepository.findByIsPopupNoticeTrueOrderByCreatedAtDesc();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
    }

    public Event createEvent(EventRequest request, MultipartFile bannerImage) {
        String bannerPath = null;
        if (bannerImage != null && !bannerImage.isEmpty()) {
            bannerPath = fileStorageService.storeFile(bannerImage, "events");
        }

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setVenue(request.getVenue());
        event.setBannerImagePath(bannerPath);
        event.setIsPopupNotice(request.getIsPopupNotice() != null ? request.getIsPopupNotice() : false);

        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, EventRequest request, MultipartFile bannerImage) {
        Event event = getEventById(id);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getEventDate());
        event.setVenue(request.getVenue());
        if (request.getIsPopupNotice() != null) {
            event.setIsPopupNotice(request.getIsPopupNotice());
        }
        if (bannerImage != null && !bannerImage.isEmpty()) {
            String bannerPath = fileStorageService.storeFile(bannerImage, "events");
            event.setBannerImagePath(bannerPath);
        }
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
