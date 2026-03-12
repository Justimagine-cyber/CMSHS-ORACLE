#include <opencv2/aruco.hpp>
#include <opencv2/core.hpp>

// This function will be called by your JS
extern "C" {
    void processFrame(uint8_t* buffer, int width, int height) {
        // 1. Convert buffer to cv::Mat
        // 2. Detect ArUco Markers
        // 3. Return ID and Pose (Rotation/Translation)
        // 4. Update Triage Mapping logic
    }
}
