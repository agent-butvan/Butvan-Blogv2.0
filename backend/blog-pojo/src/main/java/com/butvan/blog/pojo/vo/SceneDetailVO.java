package com.butvan.blog.pojo.vo;

import com.butvan.blog.pojo.entity.Hotspot;
import com.butvan.blog.pojo.entity.Scene;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SceneDetailVO {
    private Scene scene;
    private List<Hotspot> hotspots;
}
