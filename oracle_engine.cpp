#include <emscripten/bind.h>
#include <string>
#include <map>

using namespace emscripten;

enum SystemMode { TRIAGE_MODE, HAZARD_MODE };

class OracleKernel {
public:
    SystemMode mode = TRIAGE_MODE;

    void setMode(int m) {
        mode = (m == 0) ? TRIAGE_MODE : HAZARD_MODE;
    }

    std::string processDetection(int id) {
        if (mode == TRIAGE_MODE) {
            std::map<int, std::string> triage = {{1,"Minor"}, {2,"Delayed"}, {3,"Immediate"}, {4,"Deceased"}};
            return triage.count(id) ? triage[id] : "UNKNOWN_TRIAGE";
        } else {
            std::map<int, std::string> hazard = {{1,"Fire"}, {2,"Blocked Exit"}, {3,"Injured"}, {4,"Structure"}};
            return hazard.count(id) ? hazard[id] : "UNKNOWN_HAZARD";
        }
    }
};

// Binding code for JS access
EMSCRIPTEN_BINDINGS(oracle_module) {
    class_<OracleKernel>("OracleKernel")
        .constructor<>()
        .function("setMode", &OracleKernel::setMode)
        .function("processDetection", &OracleKernel::processDetection);
}
