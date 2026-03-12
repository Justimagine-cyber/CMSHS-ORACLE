#include <iostream>
#include <map>
#include <string>

enum SystemMode { TRIAGE_MODE, HAZARD_MODE };

struct DetectionResult {
    int id;
    std::string type;
    std::string label;
};

class OracleEngine {
public:
    SystemMode currentMode = TRIAGE_MODE;

    DetectionResult processDetection(int id) {
        std::string label = "Unknown";
        std::string category = (currentMode == TRIAGE_MODE) ? "TRIAGE" : "HAZARD";

        if (currentMode == TRIAGE_MODE) {
            std::map<int, std::string> triageMap = {
                {1, "Minor"}, {2, "Delayed"}, {3, "Immediate"}, {4, "Deceased"}
            };
            if (triageMap.count(id)) label = triageMap[id];
        } 
        else {
            std::map<int, std::string> hazardMap = {
                {1, "Fire"}, {2, "Blocked Exit"}, {3, "Injured Person"}, {4, "Structural Damage"}
            };
            if (hazardMap.count(id)) label = hazardMap[id];
        }

        return {id, category, label};
    }
};
